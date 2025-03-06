const express = require('express')
const {getItem, getItems, updateItem, createItem, deleteItem} = require ('../controllers/users.js')
const { validatorCreateItem } = require("../validators/users.js");
const router = require('./storage.js');

const userRouter = express.Router();

userRouter.get('/', getItems);
userRouter.get('/:email', getItem);
userRouter.post('/', createItem);
router.post("/", validatorCreateItem, createItem)
userRouter.put('/:email', (req, res) => {
    console.log(req.params);
    updateItem(req, res);
});
userRouter.delete('/:email', deleteItem);

module.exports = userRouter;