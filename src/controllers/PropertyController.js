import propertySchema from "../../validation/propertyValidation.js";
import Property from "../models/Property.js";

class PropertyController{
    createproperty = async(req, res)=>{
        try {
            await propertySchema.validateAsync(req.body);

            const PropertyModel =  Property.getModel();
            const newproperty = new PropertyModel(req.body);
            const savedproperty = await newproperty.save();
            
            res.status(201).json(savedproperty);
        }catch(error){
            if(error.isJoi){
                res.status(400).json({ error: error.details[0].message});
            }else {
            console.error('Error creating property:', error);
            res.status(500).json({error: 'internal server error'});
            }
        }
    };
}
export default new PropertyController();