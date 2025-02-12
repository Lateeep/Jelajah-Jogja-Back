import ReviewHotelModel from "../models/ReviewHotelModel.js";
import HotelModel from "../models/HotelModel.js";

export const getAllReviewHotel = async (req, res) => {
  try {
    const response = await ReviewHotelModel.findAll ();
    res.status (200).json (response);
  } catch (error) {
    res.status (500).json ({msg: error.message});
  }
};


export const getReviewByWisataId = async (req, res) => {
  try {
    const response = await ReviewHotelModel.findAll(
      {
        where: {
          hotelId: req.params.id
        }
      },
      {
        include: [
          {
            model: HotelModel
          }
        ]
      }
    );
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const createReview = async (req, res) => {
  if (!req.body.name || !req.body.review || !req.body.rating) {
    return res.status(400).json({ msg: "Masukan semua inputan" });
  }
  const { name, review, rating } = req.body;
  const date = new Date().toLocaleDateString();
  const hotel = await HotelModel.findOne({
    where: {
      id: req.params.id
    }
  });
  if (!hotel) {
    return res.status(404).json({ msg: "Hotel tidak ditemukan" });
  }
  let totalRating;
  let totalRevewers;
  if (hotel.total_rating === null) {
    totalRating = rating;
    totalRevewers = 1;
  } else {
    totalRating = hotel.total_rating + parseInt(rating);
    totalRevewers = hotel.total_viewers + 1;
  }
  const averageRating = totalRating / totalRevewers;
  await HotelModel.update(
    {
      nama: hotel.nama,
      lokasi: hotel.lokasi,
      deskripsi: hotel.deskripsi,
      image: hotel.image,
      url: hotel.url,
      total_rating: totalRating,
      total_viewers: totalRevewers,
      rating: averageRating
    },
    {
      where: {
        id: hotel.id
      }
    }
  );
  try {
    await ReviewHotelModel.create({
      name: name,
      review: review,
      rating: rating,
      date: date,
      hotelId: hotel.id
    });
    res.status(201).json({ msg: "review berhasil ditambah" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
