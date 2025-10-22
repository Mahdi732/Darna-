import Property from "../models/Property.js";

class PropertyController{
    createproperty = async(req, res)=>{
        try {
            const PropertyModel =  Property.getModel();
            const newproperty = new PropertyModel(req.body);
            const savedproperty = await newproperty.save();
            
            res.status(201).json(savedproperty);
        }catch(error){
            console.error('Error creating property:', error);
            res.status(500).json({error: 'internal server error'});
        }
    };
}
export default new PropertyController();