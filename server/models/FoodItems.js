module.exports = (sequelize, DataTypes) => {
    const FoodItems = sequelize.define("FoodItems", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        foodContentInfo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        imageURL: {
            type: DataTypes.STRING,
            allowNull: false
        },
        purchaseCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    FoodItems.associate = (models) => {
        FoodItems.hasMany(models.Reviews, {
            onDelete: "cascade"
        });
    }

    return FoodItems;
}