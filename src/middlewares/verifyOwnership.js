import Property from "../models/Property.js";

const verifyOwnership = async(req, res, next) =>{
    try{
        const PropertyModel = property.getModel();
        const propertyId = req.params.id;
        const userId = req.user.id;

        const property = await PropertyModel.findById(propertyId);

        if(!property){
            return res.status(404).json({error: 'property not found'});
        }
        if(property.ownerId.toString() !== userId){
            return res.status(403).json({ error: 'you do not have premission to modify this property'});
        }
        next();
    }catch(error){
        console.error('error verifying ownership',error);
        res.status(500).json({error : 'internal server error'});
    }
};

export default verifyOwnership;