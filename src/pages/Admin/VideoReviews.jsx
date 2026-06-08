import { useEffect, useState } from 'react';
import AdminNav from './AdminNav';
import { getVideoReviews, addVideoReview, updateVideoReview, deleteVideoReview } from '../../services/videoReviewsService';
import { uploadVideo } from '../../firebase/cloudinaryUploadService';
import './VideoReviews.css';

export default function AdminVideoReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    city: '',
    video: '',
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getVideoReviews();
      setReviews(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load video reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVideoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      const videoUrl = await uploadVideo(file, { folder: 'videoReviews' });
      setFormData((prev) => ({
        ...prev,
        video: videoUrl,
      }));
      setSuccess('Video uploaded successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error uploading video:', err);
      setError(err.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.city || !formData.video) {
      setError('Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        await updateVideoReview(editingId, {
          title: formData.title,
          city: formData.city,
          video: formData.video,
        });
        setSuccess('Video review updated successfully');
      } else {
        await addVideoReview({
          title: formData.title,
          city: formData.city,
          video: formData.video,
        });
        setSuccess('Video review added successfully');
      }

      setFormData({ title: '', city: '', video: '' });
      setShowForm(false);
      setEditingId(null);
      setError(null);
      fetchReviews();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving review:', err);
      setError('Failed to save video review');
    }
  };

  const handleEdit = (review) => {
    setFormData({
      title: review.title,
      city: review.city,
      video: review.video,
    });
    setEditingId(review.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video review?')) {
      try {
        await deleteVideoReview(id);
        setSuccess('Video review deleted successfully');
        setError(null);
        fetchReviews();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting review:', err);
        setError('Failed to delete video review');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', city: '', video: '' });
    setError(null);
  };

  return (
    <div className="adminShell">
      <AdminNav />

      <div className="adminMain">
        <header className="adminDashHead">
          <div>
            <h1>Video Reviews</h1>
            <p>Manage customer video reviews that appear on the homepage</p>
          </div>
          <button
            className="adminAddButton"
            onClick={() => setShowForm(true)}
            disabled={showForm}
          >
            + Add Video Review
          </button>
        </header>

        {success && (
          <div className="adminAlert adminAlert-success">
            {success}
          </div>
        )}

        {error && (
          <div className="adminAlert adminAlert-error">
            {error}
          </div>
        )}

        {showForm && (
          <div className="adminFormContainer">
            <h2>{editingId ? 'Edit Video Review' : 'Add New Video Review'}</h2>
            <form onSubmit={handleSubmit} className="adminForm">
              <div className="formGroup">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Luxury Living Room"
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai"
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="video">Video File or URL</label>
                <div className="videoUploadSection">
                  <input
                    type="file"
                    id="videoFile"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    disabled={uploading}
                    style={{ marginBottom: '10px' }}
                  />
                  <small style={{ display: 'block', color: '#666', marginBottom: '10px' }}>
                    {uploading ? 'Uploading video...' : 'Upload a video file (or paste URL below)'}
                  </small>
                  <input
                    type="url"
                    id="video"
                    name="video"
                    value={formData.video}
                    onChange={handleInputChange}
                    placeholder="https://example.com/video.mp4"
                    required
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="formActions">
                <button type="submit" className="adminButton adminButton-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : editingId ? 'Update' : 'Add'} Review
                </button>
                <button type="button" className="adminButton adminButton-secondary" onClick={handleCancel} disabled={uploading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && (
          <div className="adminLoading">
            <p>Loading video reviews...</p>
          </div>
        )}

        {!loading && reviews.length === 0 && !showForm && (
          <div className="adminEmpty">
            <p>No video reviews yet. Click "Add Video Review" to create one.</p>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="adminTable">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>City</th>
                  <th>Video URL</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>{review.title}</td>
                    <td>{review.city}</td>
                    <td className="videoUrlCell">
                      <a href={review.video} target="_blank" rel="noopener noreferrer">
                        View Video
                      </a>
                    </td>
                    <td className="actionsCell">
                      <button
                        className="adminActionButton adminActionButton-edit"
                        onClick={() => handleEdit(review)}
                      >
                        Edit
                      </button>
                      <button
                        className="adminActionButton adminActionButton-delete"
                        onClick={() => handleDelete(review.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
