use near_sdk::store::{Vector, IterableMap};
use near_sdk::{env, near, AccountId, BorshStorageKey, PanicOnDefault, Promise, PromiseOrValue};
use near_sdk::json_types::U64;
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
}; 

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_sdk::collections::LazyOption;

#[near]
#[derive(BorshStorageKey)]
pub enum Prefix {
    Vector,
    IterableMap,
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

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Contract {
    owner: AccountId,
    tokens: NonFungibleToken,
    item_counter: U64,
    nfts: Vector<NftData>,
    metadata: LazyOption<NFTContractMetadata>,
    token_iterable: IterableMap<TokenId, U64>,
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
            token_iterable:IterableMap::new(Prefix::IterableMap),   
        }
    }

    #[payable]
    pub fn mint(&mut self,token_id: TokenId, token_metadata: TokenMetadata) -> Token {
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
    pub fn burn(&mut self, index: U64) {
        let owner_id = env::signer_account_id();
    
        let nft_data = self.nfts.get(index.0 as u32).expect("NFT not found.");
        assert_eq!(&nft_data.owner, &owner_id, "You do not own this token.");
    
        let zero_address: AccountId = "0000000000000000000000000000000000000000".parse().expect("Invalid burn address");
    
        self.tokens.nft_transfer(zero_address.clone(), nft_data.token_id.clone(), None, None);
    
        let mut updated_nft_data = nft_data.clone(); 
        updated_nft_data.owner = zero_address;
        updated_nft_data.data = None;
    
        self.nfts.replace(index.0 as u32, updated_nft_data);
    }
    
    pub fn get_index(&self, token_id:TokenId) -> U64 {
        self.token_iterable[&token_id]
    }
    
    pub fn get_total_count(&self) -> U64 {
        self.item_counter
    }

    pub fn get_nft(&self, index:U64) -> Option<NftData> {
        self.nfts.get(index.0 as u32).cloned()
    }

    pub fn get_owner_of_contract(&self) -> AccountId {
        self.owner.clone()
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

