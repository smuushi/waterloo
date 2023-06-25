//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract {

    // State Variables
    address public immutable owner;
    string public greeting = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    string public situation = "there is a bear attacking ur village";


    mapping(address => uint) public userGreetingCounter;

    // Events: a way to emit log statements from smart contract that can be listened to by external parties
    event GreetingChange(address indexed greetingSetter, string newGreeting, bool premium, uint256 value);


    //OUR CODE
    
    event newVillagerEvent(address indexed villagerOwnerAddress, uint id, string name, uint dna);

    //

    // Constructor: Called once on contract deployment
    // Check packages/hardhat/deploy/00_deploy_your_contract.ts
    constructor(address _owner) {
        owner = _owner;
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    // Check the withdraw() function
    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    
    /**
     * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
     *
     * @param _newGreeting (string memory) - new greeting to save on the contract
     */
    function setGreeting(string memory _newGreeting) public payable {
        // Print data to the hardhat chain console. Remove when deploying to a live network.
        console.log("Setting new greeting '%s' from %s",  _newGreeting, msg.sender);

        // Change state variables
        // _newGreeting = "asdf";
        greeting = _newGreeting;
        totalCounter += 1;
        userGreetingCounter[msg.sender] += 1;

        // msg.value: built-in global variable that represents the amount of ether sent with the transaction
        if (msg.value > 0) {
            premium = true;
        } else {
            premium = false;
        }

        // emit: keyword used to trigger an event
        emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, 0);
    }

//  OUR CODE BELOWWW

    uint dnaDigits = 3;
    uint dnaModulus = 10 ** dnaDigits;

    struct Villager {
        string name;
        uint dna;
        address owner;
    }

    

    Villager[] public allVillagers;

    function showAllVillagers() public view returns(Villager[] memory) {
        return allVillagers;
    }

    // function getOwnedNFTs(address _contractAddress, address _walletAddress) public view returns (uint256[] memory) {
    //     uint256[] memory ownedNFTs = new uint256[](ERC721(_contractAddress).balanceOf(_walletAddress));
    //         for (uint256 i = 0; i < ownedNFTs.length; i++) {
    //             // ownedNFTs[i] = ERC721(_contractAddress).tokenOfOwnerByIndex(_walletAddress, i);
    //         }
    //     return ownedNFTs;
    // }

    // function showOwnedVillagers() public view returns(Villager[] memory) {
    //     // uint[] memory ownedVillagersIds;

    //     // for(uint i = 0; i < allVillagers.length; i++) {
    //     //     if (villagerToOwner[i] == msg.sender) {
    //     //         ownedVillagersIds[i] = i;
    //     //     }
    //     // }

    //     // return ownedVillagersIds;
    // }

    mapping (uint => address) public villagerToOwner; // hash for villager id => wallet address
    mapping (address => uint) ownerVillagerCount; // hash for wallet address => their number of villagers they own. 

    function _createVillager(string memory _name, uint _dna) private{
        allVillagers.push(Villager(_name, _dna, msg.sender));
        uint id = allVillagers.length - 1;
        // address ownerAddress = msg.sender;
        villagerToOwner[id] = msg.sender;
        ownerVillagerCount[msg.sender]++;
        emit newVillagerEvent(msg.sender, id, _name, _dna);
    }

    function _generateRandomDna(string memory _str) private view returns(uint) {
        uint rand = uint(keccak256(abi.encodePacked(_str)));
        if (rand % dnaModulus > 755) return 754;

        return rand % dnaModulus;

        
    }

    function createRandomVillager(string memory _name) public {
        // require(ownerZombieCount[msg.sender] == 0);
        uint randDna = _generateRandomDna(_name);
        _createVillager(_name, randDna);
    }


    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() isOwner public {
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
