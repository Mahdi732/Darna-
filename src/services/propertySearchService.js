import Property from "../models/Property";

const searchPropreties = async function name(filters) {
      const PropertyModel = Property.getModel();
  const {
    keyword,
    location,
    radius, // in kilometers
    minPrice,
    maxPrice,
    transactionType,
    minSurface,
    maxSurface,
    rooms,
    bathrooms,
    amenities,
    status = 'published',
    sort = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 10
  } = filters;
  
  let searchQuery = { status };

  if (keyword) {
    searchQuery.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } }
    ];
  }
  if( transactionType){
    searchQuery.transactionType = transactionType;
  }

  if(minPrice || maxPrice){
    searchQuery.price = {};
    if(minPrice) searchQuery.price.$gte = Number(minPrice);
    if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
  }
  if(minSurface || maxSurface){
    searchQuery.surface = {};
    if(minSurface) searchQuery.surface.$gte = Number(minSurface);
    if(maxSurface) searchQuery.surface.$lte = Number(maxSurface);
  }
  if(rooms){
    searchQuery.rooms = {$gte : Number(rooms)};
  }
  if(bathrooms){
    searchQuery.bathrooms = { $gte: Number(bathrooms)};
  }
  if(location && radius) {
    const [longitude, latitude] = location.split(',').map(Number);
    searchQuery.amenilities = { $in : amenitiesArray};
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

  const skip = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const properties = await PropertyModel.find(searchQuery)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

  const total = await PropertyModel.countDocuments(searchQuery);
  return {
    count: properties.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    properties
  };
};
export default searchPropreties;