module.exports = (sequelize, DataTypes) => {
    const Reviews = sequelize.define("Reviews", {
        reviewText: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    return Reviews;
}