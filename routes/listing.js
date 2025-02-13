const express = require("express");
const router = express.Router();
const {
  Marvel,
  History,
  PopularMovie,
  Comedy,
  Kid,
} = require("../models/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const { isLoggedIn } = require("../middleware.js");

const models = {
  marvel: Marvel,
  history: History,
  popularMovie: PopularMovie,
  comedy: Comedy,
  kid: Kid,
};

router.get("/", async (req, res) => {
  const marvelListings = await Marvel.find({});
  const historyListings = await History.find({});
  const popularMovieListings = await PopularMovie.find({});
  const comedyListings = await Comedy.find({});
  const kidListings = await Kid.find({});

  let currUser = req.user;
  res.render("listings/index.ejs", {
    marvelListings,
    historyListings,
    popularMovieListings,
    comedyListings,
    kidListings,
    currUser,
  });
});

router.get("/search", async (req, res) => {
  const marvelListings = await Marvel.find({});
  const historyListings = await History.find({});
  const popularMovieListings = await PopularMovie.find({});
  const comedyListings = await Comedy.find({});
  const kidListings = await Kid.find({});
  let key = req.query.key;
  res.render("listings/search.ejs", {
    marvelListings,
    historyListings,
    popularMovieListings,
    comedyListings,
    kidListings,
    key,
  });
});

router.get("/new/:show", isLoggedIn, async (req, res) => {
  const category =
    req.params.show.replace("new", "").charAt(0).toLowerCase() +
    req.params.show.replace("new", "").slice(1);
  if (!models[category]) {
    return res.status(400).send("Invalid category");
  }

  res.render("listings/new.ejs", { category });
});

router.post(
  "/:category",
  upload.fields([
    { name: "listing[image]", maxCount: 1 },
    { name: "listing[imgBanner]", maxCount: 1 },
    { name: "listing[logo]", maxCount: 1 },
  ]),
  async (req, res, next) => {
    const category = req.params.category;
    const Model = models[category];

    if (!Model) {
      return res.status(400).send("Invalid category");
    }

    try {
      const image = req.files["listing[image]"]?.[0]?.path;
      const imgBanner = req.files["listing[imgBanner]"]?.[0]?.path;
      const logo = req.files["listing[logo]"]?.[0]?.path;
      const newListing = new Model(req.body.listing);
      newListing.image = image;
      newListing.imgBanner = imgBanner;
      newListing.logo = logo;
      await newListing.save();
      req.flash("success", "New Show Added!");
      res.redirect("/listings");
    } catch (err) {
      console.error(`Error adding ${category} listing:`, err);
      next(err);
    }
  }
);

router.get("/:new", async (req, res) => {
  const category = req.params.new;
  const Model = models[category];

  if (!Model) {
    return res.status(400).send("Invalid category");
  }

  try {
    const Listings = await Model.find({});
    res.render("listings/listing.ejs", { Listings, category });
  } catch (err) {
    console.error(`Error fetching ${category} listings:`, err);
    res.status(500).send("Internal server error");
  }
});

router.get("/:category/:id", async (req, res) => {
  const { category, id } = req.params;
  const Model = models[category];

  if (!Model) {
    console.error(`Invalid category: ${category}`);
    return res.status(400).send("Invalid category");
  }

  try {
    const listing = await Model.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/interface.ejs", {
      listing,
      category,
    });
  } catch (err) {
    console.error(`Error fetching ${category} listing with id ${id}:`, err);
    res.status(500).send("Internal server error");
  }
});

router.get("/:category/:id/video", isLoggedIn, async (req, res) => {
  const { category, id } = req.params;
  const Model = models[category];

  if (!Model) {
    console.error(`Invalid category: ${category}`);
    return res.status(400).send("Invalid category");
  }

  try {
    const listing = await Model.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/video.ejs", { listing });
  } catch (err) {
    console.error(`Error fetching ${category} listing with id ${id}:`, err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
