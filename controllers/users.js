const UserModel = require('../models/users.js');
const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleError');

const getItems = async (req, res) => {
    try {
        const data = await UserModel.find({});
        res.json(data);
    } catch (err) {
        handleHttpError(res, 'ERROR_GET_ITEMS', 500);
    }
};

const getItem = async (req, res) => {
    try {
        const { email } = req.params;  // Extraemos email de params
        if (!email) {
            return res.status(400).json({ error: "El email es requerido" });
        }

        const data = await UserModel.findOne({ email });
        if (!data) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(data);
    } catch (err) {
        handleHttpError(res, 'ERROR_GET_ITEM', 500);
    }
};

const createItem = async (req, res) => {
    try {
        const data = await UserModel.create(req.body);
        res.status(201).json(data);
    } catch (err) {
        handleHttpError(res, 'ERROR_CREATE_ITEM', 500);
    }
};

const updateItem = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({ error: "El email es requerido" });
        }

        const data = await UserModel.findOneAndReplace(
            { email }, 
            req.body, 
            { returnDocument: 'after' }
        );

        if (!data) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(data);
    } catch (err) {
        handleHttpError(res, 'ERROR_UPDATE_ITEM', 500);
    }
};

const deleteItem = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({ error: "El email es requerido" });
        }

        const data = await UserModel.findOneAndDelete({ email });

        if (!data) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado", data });
    } catch (err) {
        handleHttpError(res, 'ERROR_DELETE_ITEM', 500);
    }
};

module.exports = { getItem, getItems, updateItem, createItem, deleteItem };
