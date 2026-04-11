import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

export default function AdminServices() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'detailing',
    description: '',
    full_description: '',
    price: '',
    duration: '',
    image_url: '',
    additional_pricing: '',
    is_active: true,
    display_order: 0,
    whats_included: [],
    exterior_points: [],
    interior_points: [],
    specifications: [],
    film_features: []
  });

  const categories = [
    { value: 'detailing', label: 'Detailing' },
    { value: 'vehicle-wrap', label: 'Vehicle Wrap' },
    { value: 'ceramic-coating', label: 'Ceramic Coating' },
    { value: 'paint-protection-film', label: 'Paint Protection Film' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'window-tinting', label: 'Window Tinting' }
  ];

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    // Use environment variable for password or default
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect password');
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch services on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
    }
  }, [isAuthenticated]);

  // Calculate page height on mount and when services change
  useEffect(() => {
    const timer = setTimeout(() => {
      calculatePageHeight();
    }, 200);

    return () => clearTimeout(timer);
  }, [services, showModal, selectedCategory]);

  // Fetch all services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/services/get-all');

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();

      if (data.success) {
        setServices(data.services || []);
      } else {
        throw new Error(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Calculate page height
  const calculatePageHeight = () => {
    if (typeof window !== 'undefined') {
      const wrapper = document.getElementById('wrapper');
      const body = document.body;

      if (wrapper && body) {
        const windowHeight = window.innerHeight;
        const contentHeight = wrapper.scrollHeight;

        if (contentHeight > windowHeight) {
          body.style.height = contentHeight + 'px';
        } else {
          body.style.height = windowHeight + 'px';
        }
      }
    }
  };

  // Open modal for creating new service
  const handleCreate = () => {
    console.log('handleCreate called');
    setModalMode('create');
    setFormData({
      title: '',
      category: 'detailing',
      description: '',
      full_description: '',
      price: '',
      duration: '',
      image_url: '',
      additional_pricing: '',
      is_active: true,
      display_order: 0,
      whats_included: [],
      exterior_points: [],
      interior_points: [],
      specifications: [],
      film_features: []
    });
    setShowModal(true);
    console.log('showModal set to true');

    // Recalculate height after modal opens
    setTimeout(() => {
      calculatePageHeight();
    }, 100);
  };

  // Open modal for editing service
  const handleEdit = (service) => {
    setModalMode('edit');
    setSelectedService(service);
    setFormData({
      title: service.title,
      category: service.category,
      description: service.description,
      full_description: service.full_description,
      price: service.price,
      duration: service.duration,
      image_url: service.image_url || '',
      additional_pricing: service.additional_pricing || '',
      is_active: service.is_active,
      display_order: service.display_order || 0,
      whats_included: service.whats_included || [],
      exterior_points: service.exterior_points || [],
      interior_points: service.interior_points || [],
      specifications: service.specifications || [],
      film_features: service.film_features || []
    });
    setShowModal(true);

    // Recalculate height after modal opens
    setTimeout(() => {
      calculatePageHeight();
    }, 100);
  };

  // Handle adding items to arrays
  const handleAddItem = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }));
  };

  // Handle removing items from arrays
  const handleRemoveItem = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  // Handle updating items in arrays
  const handleUpdateItem = (fieldName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up form data - filter out empty strings from arrays
      const cleanedFormData = {
        ...formData,
        whats_included: formData.whats_included.filter(item => item.trim() !== ''),
        exterior_points: formData.exterior_points.filter(item => item.trim() !== ''),
        interior_points: formData.interior_points.filter(item => item.trim() !== ''),
        specifications: formData.specifications.filter(item => item.trim() !== ''),
        film_features: formData.film_features.filter(item => item.trim() !== '')
      };

      if (modalMode === 'create') {
        // Create new service
        const response = await fetch('/api/services/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cleanedFormData)
        });

        const data = await response.json();

        if (data.success) {
          alert('Service created successfully!');
          setShowModal(false);
          fetchServices(); // Refresh the list

          // Recalculate height after closing form
          setTimeout(() => {
            calculatePageHeight();
          }, 100);
        } else {
          alert('Failed to create service: ' + data.message);
        }
      } else {
        // Update existing service
        const response = await fetch('/api/services/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: selectedService.id,
            ...cleanedFormData
          })
        });

        const data = await response.json();

        if (data.success) {
          alert('Service updated successfully!');
          setShowModal(false);
          fetchServices(); // Refresh the list

          // Recalculate height after closing form
          setTimeout(() => {
            calculatePageHeight();
          }, 100);
        } else {
          alert('Failed to update service: ' + data.message);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete service
  const handleDelete = async (service) => {
    if (!confirm(`Are you sure you want to delete "${service.title}"?`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/services/delete?id=${service.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Service deleted successfully!');
        fetchServices(); // Refresh the list
      } else {
        alert('Failed to delete service: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('An error occurred: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter services by category
  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout title="Admin Login">
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#111'
        }}>
          <div style={{
            background: '#1a1a1a',
            padding: '40px',
            borderRadius: '12px',
            border: '1px solid #333',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '30px', textAlign: 'center' }}>Admin Login</h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '16px'
                  }}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              {authError && (
                <p style={{ color: '#dc2626', marginBottom: '15px', fontSize: '14px' }}>{authError}</p>
              )}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
    <Layout title="Admin - Manage Services">
      <style jsx global>{`
        body {
          overflow: hidden !important;
        }
      `}</style>
      <style jsx>{`
        .admin-services-page {
          padding: 80px 0 40px;
          min-height: 100vh;
          background: #111;
          color: white;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-left h1 {
          font-size: 32px;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 5px;
        }

        .header-left p {
          font-size: 16px;
          color: #888;
        }

        .add-service-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .add-service-btn:hover {
          background: #b91c1c;
          transform: translateY(-2px);
        }

        .category-filter {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          border: 1px solid #333;
        }

        .category-filter h3 {
          font-size: 16px;
          color: #dc2626;
          margin-bottom: 15px;
        }

        .category-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .category-tab {
          background: #2a2a2a;
          color: #ccc;
          border: 1px solid #444;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .category-tab:hover {
          background: #333;
          border-color: #dc2626;
        }

        .category-tab.active {
          background: #dc2626;
          color: white;
          border-color: #dc2626;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .service-card {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #333;
          transition: all 0.3s ease;
        }

        .service-card:hover {
          border-color: #dc2626;
          transform: translateY(-5px);
        }

        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .service-title {
          font-size: 18px;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 5px;
        }

        .service-category {
          display: inline-block;
          background: #333;
          color: #ccc;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .service-description {
          color: #aaa;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .service-details {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          padding-top: 15px;
          border-top: 1px solid #333;
        }

        .service-price {
          color: #4ade80;
          font-size: 16px;
          font-weight: bold;
        }

        .service-duration {
          color: #ccc;
          font-size: 14px;
        }

        .service-actions {
          display: flex;
          gap: 10px;
        }

        .edit-btn, .delete-btn {
          flex: 1;
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .edit-btn {
          background: #4285f4;
          color: white;
        }

        .edit-btn:hover {
          background: #3367d6;
        }

        .delete-btn {
          background: #dc2626;
          color: white;
        }

        .delete-btn:hover {
          background: #b91c1c;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: bold;
        }

        .status-badge.active {
          background: #16a34a;
          color: white;
        }

        .status-badge.inactive {
          background: #888;
          color: white;
        }

        /* Form styles */
        .close-btn {
          background: transparent;
          border: none;
          color: #888;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #dc2626;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          color: #ccc;
          font-size: 14px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          background: #2a2a2a;
          border: 1px solid #444;
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #dc2626;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
        }

        .submit-btn, .cancel-btn {
          flex: 1;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .submit-btn {
          background: #dc2626;
          color: white;
        }

        .submit-btn:hover {
          background: #b91c1c;
        }

        .cancel-btn {
          background: #444;
          color: white;
        }

        .cancel-btn:hover {
          background: #555;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #888;
        }

        .empty-state h3 {
          color: #dc2626;
          margin-bottom: 10px;
          font-size: 20px;
        }

        .empty-state .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #333;
          border-top: 4px solid #dc2626;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Dynamic List Styles */
        .dynamic-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .list-item {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .list-item input {
          flex: 1;
          background: #2a2a2a;
          border: 1px solid #444;
          color: white;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 14px;
        }

        .list-item input:focus {
          outline: none;
          border-color: #dc2626;
        }

        .remove-item-btn {
          background: #dc2626;
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .remove-item-btn:hover {
          background: #b91c1c;
        }

        .add-item-btn {
          background: #4285f4;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          align-self: flex-start;
        }

        .add-item-btn:hover {
          background: #3367d6;
        }

        @media (max-width: 768px) {
          .admin-services-page {
            padding: 60px 0 20px;
          }

          .admin-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-card {
            padding: 20px;
          }
        }
      `}</style>

      <div className="admin-services-page">
        <div className="container">
          <div className="admin-header">
            <div className="header-left">
              <h1>Manage Services</h1>
              <p>Add, edit, or remove services from your website</p>
            </div>
            <button className="add-service-btn" onClick={handleCreate}>
              <span>+</span>
              Add New Service
            </button>
          </div>

          <div className="category-filter">
            <h3>Filter by Category</h3>
            <div className="category-tabs">
              <button
                className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Services
              </button>
              {categories.map(cat => (
                <button
                  key={cat.value}
                  className={`category-tab ${selectedCategory === cat.value ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loading && services.length === 0 ? (
            <div className="empty-state">
              <div className="spinner"></div>
              <p>Loading services...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <h3 style={{ color: '#dc2626' }}>Error Loading Services</h3>
              <p>{error}</p>
              <button className="add-service-btn" onClick={fetchServices} style={{ marginTop: '20px' }}>
                Retry
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {/* Inline Form Card - Shows when creating or editing */}
              {showModal && (
                <div className="service-card form-card" style={{ gridColumn: '1 / -1', maxWidth: '100%' }}>
                  <div className="service-header">
                    <h3 style={{ color: '#dc2626', fontSize: '20px', margin: 0 }}>
                      {modalMode === 'create' ? 'Add New Service' : ' Edit Service'}
                    </h3>
                    <button
                      className="close-btn"
                      onClick={() => {
                        setShowModal(false);
                        setTimeout(() => {
                          calculatePageHeight();
                        }, 100);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '24px', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                    <div className="form-group">
                      <label>Service Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., PRECISION PACKAGE"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Category *</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Display Order</label>
                        <input
                          type="number"
                          name="display_order"
                          value={formData.display_order}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Short Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Brief description shown on the card..."
                        required
                        rows="2"
                      />
                    </div>

                    <div className="form-group">
                      <label>Full Description *</label>
                      <textarea
                        name="full_description"
                        value={formData.full_description}
                        onChange={handleInputChange}
                        placeholder="Detailed description..."
                        required
                        rows="3"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Price *</label>
                        <input
                          type="text"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="e.g., From $399.99"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Duration *</label>
                        <input
                          type="text"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          placeholder="e.g., 2-4 Hours"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Image URL (Optional)</label>
                      <input
                        type="text"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="form-group">
                      <label>Additional Pricing (Optional)</label>
                      <input
                        type="text"
                        name="additional_pricing"
                        value={formData.additional_pricing}
                        onChange={handleInputChange}
                        placeholder="e.g., Add $30 SUV • Add $50 VAN"
                      />
                    </div>

                    {/* Dynamic Lists - Show based on category */}
                    {(formData.category === 'detailing' || formData.category === 'ceramic-coating') && (
                      <div className="form-group">
                        <label>What's Included</label>
                        <div className="dynamic-list">
                          {formData.whats_included.map((item, index) => (
                            <div key={index} className="list-item">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => handleUpdateItem('whats_included', index, e.target.value)}
                                placeholder="e.g., Everything from Gold Package"
                              />
                              <button
                                type="button"
                                className="remove-item-btn"
                                onClick={() => handleRemoveItem('whats_included', index)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button type="button" className="add-item-btn" onClick={() => handleAddItem('whats_included')}>
                            + Add Item
                          </button>
                        </div>
                      </div>
                    )}

                    {formData.category === 'detailing' && (
                      <>
                        <div className="form-group">
                          <label>Exterior Points</label>
                          <div className="dynamic-list">
                            {formData.exterior_points.map((item, index) => (
                              <div key={index} className="list-item">
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => handleUpdateItem('exterior_points', index, e.target.value)}
                                  placeholder="e.g., Full Foam & Hand Wash"
                                />
                                <button type="button" className="remove-item-btn" onClick={() => handleRemoveItem('exterior_points', index)}>×</button>
                              </div>
                            ))}
                            <button type="button" className="add-item-btn" onClick={() => handleAddItem('exterior_points')}>+ Add Exterior Point</button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Interior Points</label>
                          <div className="dynamic-list">
                            {formData.interior_points.map((item, index) => (
                              <div key={index} className="list-item">
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => handleUpdateItem('interior_points', index, e.target.value)}
                                  placeholder="e.g., Interior Vacuum"
                                />
                                <button type="button" className="remove-item-btn" onClick={() => handleRemoveItem('interior_points', index)}>×</button>
                              </div>
                            ))}
                            <button type="button" className="add-item-btn" onClick={() => handleAddItem('interior_points')}>+ Add Interior Point</button>
                          </div>
                        </div>
                      </>
                    )}

                    {(formData.category === 'paint-protection-film' || formData.category === 'window-tinting' || formData.category === 'vehicle-wrap') && (
                      <div className="form-group">
                        <label>Specifications</label>
                        <div className="dynamic-list">
                          {formData.specifications.map((item, index) => (
                            <div key={index} className="list-item">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => handleUpdateItem('specifications', index, e.target.value)}
                                placeholder="e.g., Full hood, Full fenders"
                              />
                              <button type="button" className="remove-item-btn" onClick={() => handleRemoveItem('specifications', index)}>×</button>
                            </div>
                          ))}
                          <button type="button" className="add-item-btn" onClick={() => handleAddItem('specifications')}>+ Add Specification</button>
                        </div>
                      </div>
                    )}

                    {formData.category === 'paint-protection-film' && (
                      <div className="form-group">
                        <label>Film Features</label>
                        <div className="dynamic-list">
                          {formData.film_features.map((item, index) => (
                            <div key={index} className="list-item">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => handleUpdateItem('film_features', index, e.target.value)}
                                placeholder="e.g., Warrantied color-stable"
                              />
                              <button type="button" className="remove-item-btn" onClick={() => handleRemoveItem('film_features', index)}>×</button>
                            </div>
                          ))}
                          <button type="button" className="add-item-btn" onClick={() => handleAddItem('film_features')}>+ Add Film Feature</button>
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          id="is_active"
                        />
                        <label htmlFor="is_active">Active (Show on website)</label>
                      </div>
                    </div>

                    <div className="modal-actions">
                      <button type="button" className="cancel-btn" onClick={() => {
                        setShowModal(false);
                        setTimeout(() => {
                          calculatePageHeight();
                        }, 100);
                      }}>
                        Cancel
                      </button>
                      <button type="submit" className="submit-btn">
                        {modalMode === 'create' ? 'Create Service' : 'Update Service'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Regular Service Cards - Only show when form is not visible */}
              {!showModal && (
                filteredServices.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Services Found</h3>
                    <p>Click "Add New Service" to create your first service.</p>
                  </div>
                ) : (
                  filteredServices.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-header">
                      <div>
                        <div className="service-category">{service.category}</div>
                        <div className="service-title">{service.title}</div>
                      </div>
                      <span className={`status-badge ${service.is_active ? 'active' : 'inactive'}`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="service-description">{service.description}</p>

                    <div className="service-details">
                      <div className="service-price">{service.price}</div>
                      <div className="service-duration">{service.duration}</div>
                    </div>

                    <div className="service-actions">
                      <button className="edit-btn" onClick={() => handleEdit(service)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(service)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
                )
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
    </>
  );
}
