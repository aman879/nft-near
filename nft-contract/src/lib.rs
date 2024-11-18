use near_sdk::store::{Vector, IterableMap};
use near_sdk::{assert_one_yocto, env, near, AccountId, BorshStorageKey, NearToken, PanicOnDefault, Promise, PromiseOrValue};
use near_sdk::json_types::U64;
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
}; 

use near_sdk::borsh::{self, BorshSerialize};
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_sdk::collections::LazyOption;

const BURN_FEE: u128 = 1_000_000_000_000_000_000_000;

#[near]
#[derive(BorshStorageKey)]
pub enum Prefix {
    Vector,
    IterableMap,
    BurnLog,
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
}

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct NftData {
    id: U64,
    owner: AccountId,
    token_id: TokenId,
    data: Option<TokenMetadata>
}

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct BurnLog {
    owner: AccountId,
    token_id: TokenId,
    token_name: Option<String>,
    timestamp: u64,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Contract {
    owner: AccountId,
    tokens: NonFungibleToken,
    item_counter: U64,
    nfts: Vector<NftData>,
    metadata: LazyOption<NFTContractMetadata>,
    token_iterable: IterableMap<TokenId, U64>,
    burn_log: Vector<BurnLog>,
    paid_burn_fee: Vector<AccountId>,
}


#[near]
impl Contract {

    #[init]
    pub fn new_default_meta() -> Self {
        Self::new(
            NFTContractMetadata {
                spec: NFT_METADATA_SPEC.to_string(),
                name: "NFT AMAN".to_string(),
                symbol: "NA".to_string(),
                icon: None,
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
        )
    }

    #[init]
    #[private]
    pub fn new(metadata: NFTContractMetadata) -> Self {
        metadata.assert_valid();
        Self {
            owner: env::signer_account_id(),
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                env::signer_account_id(),
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            item_counter: U64(0),
            nfts: Vector::new(Prefix::Vector),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            token_iterable: IterableMap::new(Prefix::IterableMap),
            burn_log: Vector::new(Prefix::BurnLog),
            paid_burn_fee: Vector::new(b"p"),
        }
    }

    #[payable]
    pub fn mint(&mut self, token_id: TokenId, token_metadata: TokenMetadata) -> Token {
        let sender = env::signer_account_id();

        let nft = NftData {
            id: self.item_counter,
            owner: sender.clone(),
            token_id: token_id.clone(),
            data: Some(token_metadata.clone()),
        };
        
        self.token_iterable.insert(token_id.clone(), self.item_counter);
        let new_counter = self.item_counter.0 + 1;
        self.item_counter = U64(new_counter);
        self.nfts.push(nft.clone());
        self.tokens.internal_mint(token_id.clone(), sender, Some(token_metadata))
    }

    #[payable]
    pub fn pay_burn_fee(&mut self) {
        assert!(
            env::attached_deposit() >= NearToken::from_yoctonear(BURN_FEE),
            "Please attach at least 0.001 NEAR as a burn fee."
        );
        
        let sender = env::signer_account_id();
        if !self.paid_burn_fee.iter().any(|acc| *acc == sender) {
            self.paid_burn_fee.push(sender.clone());
        }
    }
    
    #[payable]
    pub fn burn(&mut self, index: U64) {
        let owner_id = env::signer_account_id();

        assert!(
            self.paid_burn_fee.iter().any(|acc| *acc == owner_id),
            "Burn fee has not been paid. Please call `pay_burn_fee` first."
        );


        let nft_data = self.nfts.get(index.0 as u32).expect("NFT not found.");
        assert_eq!(&nft_data.owner, &owner_id, "You do not own this token.");
        
        let zero_address: AccountId = "0000000000000000000000000000000000000000".parse().expect("Invalid burn address");

        self.tokens.nft_transfer(zero_address.clone(), nft_data.token_id.clone(), None, None);

        let mut updated_nft_data = nft_data.clone(); 
        updated_nft_data.owner = zero_address;
        updated_nft_data.data = None;

        
        let burn_log_entry = BurnLog {
            owner: owner_id.clone(),
            token_id: nft_data.token_id.clone(),
            token_name: nft_data.data.as_ref().and_then(|meta| meta.title.clone()),
            timestamp: env::block_timestamp(),
        };
        
        self.burn_log.push(burn_log_entry); 
        self.nfts.replace(index.0 as u32, updated_nft_data);

        if let Some(pos) = self.paid_burn_fee.iter().position(|acc| *acc == owner_id) {
            self.paid_burn_fee.swap_remove(pos.try_into().unwrap());
        }
    }
    
    pub fn get_index(&self, token_id: TokenId) -> U64 {
        self.token_iterable[&token_id]
    }
    
    pub fn get_total_count(&self) -> U64 {
        self.item_counter
    }

    pub fn get_nft(&self, index: U64) -> Option<NftData> {
        self.nfts.get(index.0 as u32).cloned()
    }

    pub fn get_owner_of_contract(&self) -> AccountId {
        self.owner.clone()
    }

    pub fn get_burn_log(&self) -> Vec<BurnLog> {
        (0..self.burn_log.len())
            .filter_map(|index| self.burn_log.get(index))
            .cloned() 
            .collect()
    }
    
}

near_contract_standards::impl_non_fungible_token_core!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);

#[near]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}
