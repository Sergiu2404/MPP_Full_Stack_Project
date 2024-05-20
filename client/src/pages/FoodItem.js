import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { ServerStatusContext } from '../App'; // Ensure this is imported

function FoodItem() {
  let { id } = useParams();
  const [foodItemObject, setFoodItemObject] = useState({});
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [updatedFoodItem, setUpdatedFoodItem] = useState({});
  const [editReviewId, setEditReviewId] = useState(0);
  const [updatedReviewText, setUpdatedReviewText] = useState("");

  let navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const isServerOnline = useContext(ServerStatusContext);

  const saveFailedRequest = (request) => {
    let failedRequests = JSON.parse(localStorage.getItem("failedRequests")) || [];
    failedRequests.push(request);
    localStorage.setItem("failedRequests", JSON.stringify(failedRequests));
  };

  const retryFailedRequests = async () => {
    let failedRequests = JSON.parse(localStorage.getItem("failedRequests")) || [];
    for (let request of failedRequests) {
      try {
        await axios({ method: request.method, url: request.url, data: request.data });
      } catch (error) {
        console.log(`Retry failed for ${request.url}`);
        continue;
      }
    }
    localStorage.removeItem("failedRequests");
  };

  useEffect(() => {
    if (isServerOnline) {
      retryFailedRequests();
    }

    axios.get(`http://localhost:3001/foodItems/byId/${id}`).then((response) => {
      setFoodItemObject(response.data);
      setUpdatedFoodItem(response.data);
    }).catch(error => {
      console.error("Error fetching food item:", error);
      saveFailedRequest({ url: `http://localhost:3001/foodItems/byId/${id}`, method: "get" });
    });

    axios.get(`http://localhost:3001/reviews/${id}`).then((response) => {
      setReviews(response.data);
    }).catch(error => {
      console.error("Error fetching reviews:", error);
      saveFailedRequest({ url: `http://localhost:3001/reviews/${id}`, method: "get" });
    });
  }, [id, isServerOnline]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUpdatedFoodItem({
      ...updatedFoodItem,
      [name]: value,
    });
  };

  const updateFoodItem = () => {
    axios.put(`http://localhost:3001/foodItems/${id}`,
      updatedFoodItem,
      { headers: { accessToken: localStorage.getItem("accessToken") } }
    )
    .then((response) => {
      setFoodItemObject(response.data);
      setEditMode(false);
      alert("Food item updated successfully");
    })
    .catch((error) => {
      console.error("Error updating food item:", error);
      saveFailedRequest({ url: `http://localhost:3001/foodItems/${id}`, method: "put", data: updatedFoodItem });
    });
  };

  const addReview = () => {
    axios.post("http://localhost:3001/reviews",
      { reviewText: newReview, FoodItemId: id },
      { headers: { accessToken: localStorage.getItem("accessToken") } }
    )
    .then((response) => {
      if(response.data.error)
        alert(response.data.error);
      else {
        const reviewToAdd = { reviewText: newReview, username: response.data.username, id: response.data.id };
        setReviews([...reviews, reviewToAdd]);
        setNewReview("");
      }
    })
    .catch(error => {
      console.error("Error adding review:", error);
      saveFailedRequest({ url: "http://localhost:3001/reviews", method: "post", data: { reviewText: newReview, FoodItemId: id } });
    });
  };

  const deleteReview = (reviewId) => {
    axios.delete(`http://localhost:3001/reviews/${reviewId}`,
      { headers: { accessToken: localStorage.getItem("accessToken") } }
    )
    .then(() => {
      setReviews(reviews.filter((val) => val.id !== reviewId));
    })
    .catch((error) => {
      console.error("Error deleting review:", error);
      saveFailedRequest({ url: `http://localhost:3001/reviews/${reviewId}`, method: "delete" });
    });
  };

  const deleteFoodItem = (itemId) => {
    axios.delete(`http://localhost:3001/foodItems/${itemId}`,
      { headers: { accessToken: localStorage.getItem("accessToken") } }
    )
    .then(() => {
      navigate("/");
    })
    .catch((error) => {
      console.error("Error deleting food item:", error);
      saveFailedRequest({ url: `http://localhost:3001/foodItems/${itemId}`, method: "delete" });
    });
  };

  const handleReviewEdit = (reviewId, reviewText) => {
    setEditReviewId(reviewId);
    setUpdatedReviewText(reviewText);
  };

  const cancelReviewEdit = () => {
    setEditReviewId(0);
    setUpdatedReviewText("");
  };

  const updateReview = (reviewId) => {
    axios.put(`http://localhost:3001/reviews/${reviewId}`,
      { reviewText: updatedReviewText },
      { headers: { accessToken: localStorage.getItem("accessToken") } }
    )
    .then((response) => {
      const updatedReviews = reviews.map(review => {
        if (review.id === reviewId) {
          return { ...review, reviewText: updatedReviewText };
        }
        return review;
      });
      setReviews(updatedReviews);
      setEditReviewId(0);
      alert("Review updated successfully");
    })
    .catch((error) => {
      console.error("Error updating review:", error);
      saveFailedRequest({ url: `http://localhost:3001/reviews/${reviewId}`, method: "put", data: { reviewText: updatedReviewText } });
    });
  };

  return (
    <div className='foodItemPage'>
      <div className='leftSide'>
        <div className='foodItem' id="individual">
          {editMode ? (
            <div className="editForm">
              <label> name </label>
              <input
                type="text"
                name="name"
                value={updatedFoodItem.name || ""}
                onChange={handleInputChange}
                placeholder="Name"
                className="formInput"
              />
              <label> info about food content </label>
              <textarea
                name="foodContentInfo"
                value={updatedFoodItem.foodContentInfo || ""}
                onChange={handleInputChange}
                placeholder="Content Info"
                className="formInput"
              />
              <label> image URL </label>
              <input
                type="text"
                name="imageURL"
                value={updatedFoodItem.imageURL || ""}
                onChange={handleInputChange}
                placeholder="Image URL"
                className="formInput"
              />
              <label> Purchased by: </label>
              <input
                type="number"
                name="purchaseCount"
                value={updatedFoodItem.purchaseCount || ""}
                onChange={handleInputChange}
                placeholder="Purchase Count"
                className="formInput"
              />
              <label> price:  </label>
              <input
                type="number"
                name="price"
                value={updatedFoodItem.price || ""}
                onChange={handleInputChange}
                placeholder="Price"
                className="formInput"
              />
              <button onClick={updateFoodItem} className="formButton">Save</button>
              <button onClick={() => setEditMode(false)} className="formButton">Cancel</button>
            </div>
          ) : (
            <>
              <div className='name'>
                {foodItemObject.name}
                {authState.username === foodItemObject.username && (
                  <>
                    <button onClick={() => setEditMode(true)}>Edit</button>
                    <button onClick={() => deleteFoodItem(foodItemObject.id)}>X</button>
                  </>
                )}
              </div>
              <div className='foodContentInfo'>{foodItemObject.foodContentInfo}</div>
              <img className='foodItemImage' src={foodItemObject.imageURL} alt="Food Item Image" />
              <div className='purchaseCount'>Purchased by {foodItemObject.purchaseCount}</div>
              <div className='price'>{foodItemObject.price} lei</div>
              <div className='username'>{foodItemObject.username}</div>
            </>
          )}
        </div>
      </div>
      <div className='rightSide'>
        <div className='addReviewContainer'>
          <input
            value={newReview}
            type="text"
            placeholder='write a review....'
            autoComplete='off'
            onChange={(event) => setNewReview(event.target.value)}
          />
          <button onClick={addReview}>Add Review</button>
        </div>
        <div className='listOfReviews'>
          {reviews.map((review, key) => (
            <div key={key} className="review">
              {editReviewId === review.id ? (
                <>
                  <textarea
                    value={updatedReviewText}
                    onChange={(event) => setUpdatedReviewText(event.target.value)}
                    placeholder="Enter updated review"
                    className="formInput"
                  />
                  <div>
                    <button onClick={() => updateReview(review.id)} className="formButton">Update</button>
                    <button onClick={cancelReviewEdit} className="formButton">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div>{review.reviewText}</div>
                  <label> by {review.username} </label>
                  {authState.username === review.username && (
                    <>
                      <button onClick={() => handleReviewEdit(review.id, review.reviewText)}>Edit</button>
                      <button onClick={() => deleteReview(review.id)}>X</button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FoodItem;

