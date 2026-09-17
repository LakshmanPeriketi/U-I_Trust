import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function CreateListing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemType: '',
    condition: 'good',
    photos: [''],
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (index, value) => {
    const newPhotos = [...formData.photos];
    newPhotos[index] = value;
    setFormData((prev) => ({ ...prev, photos: newPhotos }));
  };

  const addPhotoField = () => {
    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ''] }));
  };

  const removePhotoField = (index) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, photos: newPhotos.length ? newPhotos : [''] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = (JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token);
      const cleanPhotos = formData.photos.map((p) => p.trim()).filter(Boolean);

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          itemType: formData.itemType,
          condition: formData.condition,
          photos: cleanPhotos,
          quantity: Number(formData.quantity) || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create donation listing');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Donation Listing</h1>
          <p className="text-sm text-gray-400 mt-1">List items you wish to donate to vetted NGOs in need.</p>
        </div>
        <Link
          to="/donor/my-donations"
          className="text-xs font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded transition-colors"
        >
          My Donations
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {success ? (
        <div className="bg-gray-800 border border-green-700/60 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-900/50 text-green-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
            ✓
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Listing Created Successfully!</h2>
          <p className="text-sm text-gray-300 mb-6">
            Your item is now listed. You can match it with an open requirement or manage it from your inventory.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/donor/requirement-board"
              className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              Browse NGO Requirements
            </Link>
            <Link
              to="/donor/my-donations"
              className="text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
            >
              View My Donations
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({ itemType: '', condition: 'good', photos: [''], quantity: 1 });
              }}
              className="text-xs font-medium text-gray-400 hover:text-white border border-gray-600 px-4 py-2 rounded transition-colors"
            >
              List Another Item
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-5">
          {/* Item Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Item Name / Category <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="itemType"
              required
              value={formData.itemType}
              onChange={handleChange}
              placeholder="e.g. Rice (25kg), Winter Blankets, Educational Books"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Condition & Quantity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Item Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="new">New / Unopened</option>
                <option value="good">Good (Lightly used)</option>
                <option value="fair">Fair (Usable)</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Photo URLs / Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Item Photos (Image URLs)
              </label>
              <button
                type="button"
                onClick={addPhotoField}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                + Add Photo URL
              </button>
            </div>
            <div className="space-y-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/item-photo.jpg"
                    value={photo}
                    onChange={(e) => handlePhotoChange(index, e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  {formData.photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhotoField(index)}
                      className="px-3 py-2 bg-red-900/40 text-red-300 border border-red-700/50 rounded hover:bg-red-900/70 text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

