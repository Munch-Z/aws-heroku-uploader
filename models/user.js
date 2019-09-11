module.exports = function(sequelize, DataTypes) {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            validate: {
                len: [6, 32]
            }
        },
        password: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: [8, 64]
            }
        },
        secret_answer: {
            type: DataTypes.STRING,
            allowNull: false,
        }

    })

    return User;
}