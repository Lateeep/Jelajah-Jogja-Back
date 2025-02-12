import ReviewModel from "../models/ReviewModel.js";
import WisataModel from "../models/WisataModel.js";

export const getAllReview = async (req, res) => {
  try {
    const response = await ReviewModel.findAll();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const getReviewByWisataId = async (req, res) => {
  try {
    const response = await ReviewModel.findAll(
      {
        where: {
          wisatumId: req.params.id
        }
      },
      {
        include: [
          {
            model: WisataModel
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
  const findWisata = await WisataModel.findOne({
    where: {
      id: req.params.id
    }
  });
  if (!findWisata) {
    return res.status(404).json({ msg: "wisata tidak ditemukan" });
  }
  let totalRating;
  let totalRivewers;
  if (findWisata.total_rating === null) {
    totalRating = rating;
    totalRivewers = 1;
  } else {
    totalRating = findWisata.total_rating + parseInt(rating);
    totalRivewers = findWisata.total_viewers + 1;
  }
  const averageRating = totalRating / totalRivewers;
  await WisataModel.update(
    {
      nama: findWisata.nama,
      kategori: findWisata.kategori,
      lokasi: findWisata.lokasi,
      deskripsi: findWisata.deskripsi,
      image: findWisata.image,
      url: findWisata.url,
      total_rating: totalRating,
      total_viewers: totalRivewers,
      rating: averageRating
    },
    {
      where: {
        id: findWisata.id
      }
    }
  );
  try {
    await ReviewModel.create({
      name: name,
      review: review,
      rating: rating,
      date: date,
      wisatumId: findWisata.id
    });
    res.status(201).json({ msg: "review berhasil ditambah" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
