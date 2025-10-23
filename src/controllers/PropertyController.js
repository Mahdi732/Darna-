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
    updateProperty = async (req, res)=> {
        try {
            const PropertyModel = Property.getModel();
            const propertyId = req.params.id;

            await propertySchema.validateAsync(req.body, {presence: 'optional'});
            const updateProperty = await PropertyModel.findByIdAndUpdate(
                propertyId,
                req.body,
                { new: true, runValidators: true}
            );

            if(!updateProperty){
                return res.status(400).json({ error: 'proprety not found'});
            }
            res.json(updateProperty);
        } catch(error){
            if( error.isJoi){
                res.status(400).json({error : error.details[0].message});
            }else {
                console.error('Error updating proprety:', error);
                res.status(500).json({ error : 'internal server error'});
            }
        }
    };
    deleteProperty = async (req, res) => {
        try {
            const PropertyModel = Property.getModel();
            const propertyId = req.params.id;

            const deleteProperty = await PropertyModel.findByIdAndDelete(propertyId);

            if (!deleteProperty){
                return res.status(404).json({error:'property not found'});
            }

            res.json({ message: 'property deleted succesfully'});
        }catch(error){
            console.error('error deleting the property', error);
            res.status(500).json({ error:'internal server error'});
        }
    };
    searchPropreties = async(req, res) => {
        try{
            const PropertyModel = Property.getModel();
            const {
                keyword,
                location,
                radius,
                minPrice,
                maxPrice,
                transactionType,
                minSurface,
                maxSurface,
                rooms,
                bathrooms,
                amenities,
                status = 'published'
            } = req.query;

            let searchQuery = {status};

            if(keyword){
                searchQuery.$or = [
                    { title : { $refex: keyword, $options : 'i'} },
                    {description : {$regex: keyword , $options: 'i'} }
                ];
            }
            if(transactionType){
                searchQuery.transactionType = transactionType;
            }
            if(minPrice || maxPrice){
                if(minPrice) searchQuery.price.$gte = Number(minPrice);
                if(maxPrice) searchQuery.price.$lte = Number(maxPrice);
            }

            if(minSurface || maxSurface){
                searchQuery.surface = {};
                if(minSurface) searchQuery.maxSurface.$gte = Number(minSurface);
                if(maxSurface) searchQuery.minSurface.lte =Number(maxSurface);
            }
            if (rooms) {
        searchQuery.rooms = { $gte: Number(rooms) };
      }

      if (bathrooms) {
        searchQuery.bathrooms = { $gte: Number(bathrooms) };
      }

      if (amenities) {
        const amenitiesArray = amenities.split(',');
        searchQuery.amenities = { $in: amenitiesArray };
      }

      if (location && radius) {
        const [longitude, latitude] = location.split(',').map(Number);
        searchQuery.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radius * 1000
          }
        };
      }

      const propreties = await PropertyModel.find(searchQuery);

      res.json({
        count: propreties.length,
        propreties
      });
        }catch(error){
            console.error('Error searching properties:',error);
            res.status(500).json({ error:'internal server error'});
        }
    };
}
export default new PropertyController();