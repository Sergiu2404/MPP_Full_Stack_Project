const express = require('express');
const router = express.Router();

const {Reviews} = require("../models");
const { validateToken } = require("../middleware/AuthMiddleware");


router.get("/:foodItemId", async (req, res) => {
    const foodItemId = req.params.foodItemId; //take id from the route
    const reviews = await Reviews.findAll({where: {
        FoodItemId: foodItemId
    }});

    res.json(reviews);
});


router.post("/", validateToken, async (req, res) => {
    const review = req.body;
    const username = req.user.username;
    
    review.username = username;
    const createdReview = await Reviews.create(review);

    res.json(createdReview);
});

router.delete("/:reviewId", validateToken, async (req, res) => {
    const reviewId = req.params.reviewId;
    await Reviews.destroy({where: {id: reviewId}});

    res.json("deleted succesfully");
});

router.put("/:reviewId", validateToken, async (req, res) => {
    const id = req.params.reviewId;

    const { reviewText } = req.body;
    
    try {
        await Reviews.update(
            { reviewText },
            { where: { id: id } }
        );
        const updatedReview = await FoodItems.findByPk(id);
        res.json(updatedReview);
    } catch (error) {
        res.json({ error: error.message });
    }
});



module.exports = router;