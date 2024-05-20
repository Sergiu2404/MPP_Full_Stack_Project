const express = require('express');
const router = express.Router();
const {validateToken} = require("../middleware/AuthMiddleware");

const {FoodItems} = require("../models");


router.get("/", async (req, res) => {
    const listOfFoodItems = await FoodItems.findAll(); //select all the items from the table
    res.json(listOfFoodItems);
});

router.get("/byId/:id", async (req, res) => {
    const id = req.params.id; //take id from the route
    const foodItem = await FoodItems.findByPk(id);

    res.json(foodItem);
});

router.get("/byUserId/:id", async (req, res) => {
    const id = req.params.id; //take id from the route
    const listOfFoodItems = await FoodItems.findAll({
        where: { UserId: id }
    });

    res.json(listOfFoodItems);
});



router.post("/", validateToken , async (req, res) => {
    const foodItem = req.body;
    foodItem.username = req.user.username;
    foodItem.UserId = req.user.id;

    await FoodItems.create(foodItem);
    res.json(foodItem);
});


router.delete("/:foodItemId", validateToken, async (req, res) => {
    const foodItemId = req.params.foodItemId;
    await FoodItems.destroy({where: {id: foodItemId}});

    res.json("deleted succesfully");
});

router.put("/:id", validateToken, async (req, res) => {
    const id = req.params.id;
    const { name, foodContentInfo, imageURL, purchaseCount, price } = req.body;

    try {
        await FoodItems.update(
            { name, foodContentInfo, imageURL, purchaseCount, price },
            { where: { id: id } }
        );
        const updatedFoodItem = await FoodItems.findByPk(id);
        res.json(updatedFoodItem);
    } catch (error) {
        res.json({ error: error.message });
    }
});


module.exports = router;