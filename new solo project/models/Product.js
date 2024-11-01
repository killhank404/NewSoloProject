const mongoose = require('mongoose');

// Определение схемы товара (Product)
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true  // Название товара обязательно
    },
    price: {
        type: Number,
        required: true  // Цена обязательна
    },
    description: {
        type: String,
        required: false  // Описание не обязательно
    },
    category: {
        type: String,
        required: false  // Категория не обязательна
    },
    stock: {
        type: Number,
        required: true,  // Количество на складе обязательно
        default: 0       // По умолчанию 0
    },
    createdAt: {
        type: Date,
        default: Date.now // Дата создания товара
    }
});

// Экспорт модели товара
module.exports = mongoose.model('Product', productSchema);
