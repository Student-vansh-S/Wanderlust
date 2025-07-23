const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});    
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};


module.exports.showListings = async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id).populate({path:"reviews", populate:{path : "author"},}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async (req,res,next)=>{
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit:1,
    }).send();
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing= new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async(req,res)=>{
    let {id}=req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
    let {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect(`/listings`);
};

module.exports.category = async (req, res) => {
  const { category } = req.params;

  const validCategories = [
    "mountains", "rooms", "trending", "iconic cities", "castles",
    "amazing pool", "camping", "farms", "arctic", "dome", "boat"
  ];

  if (!validCategories.includes(category)) {
    return res.status(404).render("listings/error", { message: "Invalid category" });
  }
  const allListings = await Listing.find({ category });
  res.render("listings/index", { allListings, category });
};


module.exports.searchBar = async (req, res) => {
  const { search } = req.query;
  if (!search || search.trim() === "") {
    req.flash("error", "Please enter a location to search.");
    return res.redirect("/listings");
  }
  const listings = await Listing.find({
    location: { $regex: search, $options: "i" }
  });
  if (listings.length === 0) {
    req.flash("error", `Sorry no listings found at '${search}' .`);
    return res.redirect("/listings");
  }
  res.render("listings/index.ejs", {
    allListings: listings,
    search
  });
};