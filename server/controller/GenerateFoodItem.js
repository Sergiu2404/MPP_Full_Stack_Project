// const faker = require("@faker-js/faker");

// const generateRandomFoodItem = () => {

//     const newFoodItem = {
//         name: faker.lorem,
//         foodContentInfo: faker.lorem,
//         imageURL: faker.lorem, // Generate a random food image URL
//         purchaseCount: faker.datatype.number(), // Random purchase count between 1 and 5000
//         price: faker.datatype.number(), // Random price between 5 and 50
//     };

//     return newFoodItem;

// };

// module.exports = generateRandomFoodItem;
const db = require('../models'); // Adjust the path as needed

const generateRandomFoodItem = async () => {
    const possibleNames = ["Pizza", "Burger", "Pasta", "Salad", "Sushi"];
    const possibleFoodContentInfo = ["Delicious", "Healthy", "Nutritious", "Tasty", "Yummy"];
    const possibleImageURLs = ["https://example.com/image1.jpg", "https://example.com/image2.jpg", "https://example.com/image3.jpg"];
    const possiblePurchaseCounts = [100, 200, 300, 400, 500];
    const possiblePrices = [10, 15, 20, 25, 30];

    return {
        name: possibleNames[Math.floor(Math.random() * possibleNames.length)],
        foodContentInfo: possibleFoodContentInfo[Math.floor(Math.random() * possibleFoodContentInfo.length)],
        imageURL: possibleImageURLs[Math.floor(Math.random() * possibleImageURLs.length)],
        purchaseCount: possiblePurchaseCounts[Math.floor(Math.random() * possiblePurchaseCounts.length)],
        price: possiblePrices[Math.floor(Math.random() * possiblePrices.length)]
    };
};

const generateAndSaveRandomFoodItem = async () => {
    try {
        const users = await db.Users.findAll();

        if (!users || users.length === 0) {
            throw new Error('No users found');
        }

        // Select a random user from the list
        const randomUser = users[Math.floor(Math.random() * users.length)];

        const newFoodItemData = await generateRandomFoodItem();
        newFoodItemData.username = randomUser.username;
        newFoodItemData.UserId = randomUser.id;

        await db.FoodItems.create(newFoodItemData);
        console.log("Random food item saved successfully.");
    } catch (error) {
        console.error("Error saving random food item to the database:", error);
    }
};

module.exports = { generateRandomFoodItem, generateAndSaveRandomFoodItem };
