const { check } = require("express-validator")
const validateResult = require("../utils/handleValidator")
const validatorCreateItem = [
    check("name").exists().notEmpty(),
    check("album").exists().notEmpty(),
    check("cover").exists().notEmpty(),
    check("artist").exists().notEmpty(),
    check("artist.name").exists().notEmpty(),
    check("artist.nickname").exists().notEmpty(),
    check("artist.nationality").exists().notEmpty(),
    check("duration.start").exists().notEmpty().isInt(),
    check("duration.end").exists().notEmpty().isInt(),
    check("mediaId").exists().notEmpty().isMongoId(),
    (req, res, next) => velidateResult(req, res, next)
    
]
module.exports = {validatorCreateItem}