pragma solidity ^0.4.23;

contract Ownable{
    address public owner;

    event OwnerChanged();

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function changeOwner(address _newOwner) public onlyOwner{
        if(_newOwner != address(0)){
            owner = _newOwner;
        }
        emit OwnerChanged();
    }
}