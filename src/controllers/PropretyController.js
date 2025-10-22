import Property from "../models/Property.js";

class PropertyController{
    createProprety = async(req, res)=>{
        try {
            const PropertyModel =  Property.getModel();
            const newProprety = new PropertyModel(req.body);
            const savedProprety = await newProprety.save();
            
            res.status(201).json(savedProprety);
        }catch(error){
            console.error('Error creating proprety:', error);
            res.status(500).json({error: 'internal server error'});
        }
    };
}
export default new PropertyController();