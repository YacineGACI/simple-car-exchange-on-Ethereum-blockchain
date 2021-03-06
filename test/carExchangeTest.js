var CarExchange = artifacts.require("./CarExchange.sol") ;

var app;


contract("CarExchange", function(accounts){
    var admin = accounts[0];
    var seller = accounts[1];
    var buyer = accounts[2];
    var car1 = 11111111;
    var car2 = 22222222;
    var car1Value = 1;
    var sellerBalance ;
    var buyerBalance ;


    var tmp ; //used for storing temporary values in the tests

    it("should have no cars registered", function(){
        return CarExchange.deployed().then(function(instance){
            app = instance;
            return app.getCarCount();
        }).then(function(carCount){
            assert.equal(carCount, 0, "Car list not initialized correctly");
        });
    });



    it("should register a new car correctly", function(){
        return CarExchange.deployed().then(function(instance){
            app = instance;
            return app.register(seller, car1);
        }).then(function(receipt){
            return app.getCarCount();
        }).then(function(carCount){
            assert.equal(carCount, 1, "Car not registered correctly") ;
            return app.getCar(car1);
        }).then(function(res){
            assert.equal(res[0], 0, "Value not set properly");
            assert.equal(res[1], seller, "Owner not set properly");
            assert.equal(res[2], false, "Listed not set properly");
            assert.equal(res[3], 0, "Index not set properly");
        });
    });


    it("should register a second car correctly", function(){
        return CarExchange.deployed().then(function(instance){
            app = instance;
            return app.register(seller, car2);
        }).then(function(receipt){
            return app.getCarCount();
        }).then(function(carCount){
            assert.equal(carCount, 2, "Second car not registered correctly") ;
            return app.getCar(car2);
        }).then(function(res){
            assert.equal(res[0], 0, "Value not set properly");
            assert.equal(res[1], seller, "Owner not set properly");
            assert.equal(res[2], false, "Listed not set properly");
            assert.equal(res[3], 1, "Index not set properly");
        });
    });


    it("should assign users to cars correctly", function(){
        return CarExchange.deployed().then(function(instance){
            app = instance;
            return app.getCarCountPerOwner(buyer);
        }).then(function(buyerCarCount){
            assert.equal(buyerCarCount, 0, "buyer car count not set properly");
            return app.getCarCountPerOwner(seller);
        }).then(function(sellerCarCount){
            assert.equal(sellerCarCount, 2, "seller car count not set properly") ;
            tmp = sellerCarCount;
            return app.ownedCars(seller);
        }).then(function(res){
            assert.equal(res[0], car1, "car1 not set properly") ;
            assert.equal(res[1], car2, "car2 not set properly") ;
        });
    });


    it("should get all the listed cars before putting car 1 to sale", function(){
        return CarExchange.deployed().then(function(instance){
            app = instance;
            return app.getAllListedCars();
        }).then(function(res){
            assert.equal(res[0], 0, "Couldn't get the listed cars correctly");
        });
    });



    it("should list a car for sale correctly", function(){
        return CarExchange.deployed().then(function(instance){
            app = instance;
            return app.list(car1, web3.toWei(car1Value, 'ether'), {from:seller});
        }).then(function(receipt){
            return app.getCar(car1);
        }).then(function(res){
            assert.equal(res[0], web3.toWei(car1Value, 'ether'), "Value not set properly");
            assert.equal(res[1], seller, "Owner not set properly");
            assert.equal(res[2], true, "Listed not set properly");
            assert.equal(res[3], 0, "Index not set properly");
        });
    });



    it("should get all the listed cars after putting car 1 to sale", function(){
        return CarExchange.deployed().then(function(instance){
            app = instance;
            return app.getAllListedCars();
        }).then(function(res){
            assert.equal(res[0], 1, "Couldn't get the listed cars correctly");
            assert.equal(res[1][0], car1, "Couldn't get the listed car correctly");
            assert.equal(res[2][0], web3.toWei(car1Value, 'ether'), "Couldn't get the listed car value correctly");
            assert.equal(res[3][0], seller, "Couldn't get the listed car owner correctly");
        });
    });


    it("should test buying a car", function(){
        return CarExchange.deployed().then(function(instance){
            app = instance;
            web3.eth.getBalance(seller, function(err,res) {
                sellerBalance = parseInt(res.toString(10)) ;
            });
            web3.eth.getBalance(buyer, function(err,res) {
                buyerBalance = parseInt(res.toString(10)) ;
            });
            return app.buy(car1, web3.toWei(car1Value, 'ether'), {from:buyer, value:web3.toWei(car1Value, 'ether')});
        }).then(function(receipt){
            return app.getCarCountPerOwner(seller) ;
        }).then(function(sellerCarCount){
            assert.equal(sellerCarCount, 1, "car not sold correctly") ;
            return app.getCarCountPerOwner(buyer);
        }).then(function(buyerCarCount){
            assert.equal(buyerCarCount, 1, "car not bought correctly") ;
            return app.getAllListedCars();
        }).then(function(res){
            assert.equal(res[0], 0, "Sold car is listed");
            return app.getCar(car1);
        }).then(function(res){
            assert.equal(res[0], web3.toWei(car1Value, 'ether'), "Value not set properly");
            assert.equal(res[1], buyer, "Owner not set properly");
            assert.equal(res[2], false, "Listed not set properly");
            assert.equal(res[3], 0, "Index not set properly");
            web3.eth.getBalance(seller, function(err,res) {
                assert.equal(parseInt(res.toString(10)), sellerBalance + parseInt(web3.toWei(car1Value, 'ether').toString(10)), "Seller is not payed");
           });
           web3.eth.getBalance(buyer, function(err,res) {
                assert.isAtMost(parseInt(res.toString(10)), buyerBalance - parseInt(web3.toWei(car1Value, 'ether').toString(10)), "Buyer has not payed");
           });
        });
    });



});