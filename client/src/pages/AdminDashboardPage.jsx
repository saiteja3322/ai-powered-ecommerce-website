import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../redux/slices/productSlice';
import { fetchAllOrdersAdmin, updateOrderStatusAdmin } from '../redux/slices/orderSlice';
import api from '../services/api';
import { 
  BarChart3, DollarSign, ShoppingBag, Users, Plus, Sparkles, Trash2, Edit, Eye, Check, X, ShieldAlert,
  UploadCloud, Search, Filter, ChevronLeft, ChevronRight, Image as ImageIcon, AlertTriangle, Tag, Box,
  TrendingUp, RefreshCw, CheckCircle2, AlertCircle, Menu, LayoutDashboard, Package, Truck, PieChart,
  Layers, ArrowUpRight, Copy, CheckSquare
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { formatINR } from '../utils/formatCurrency';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

const CATEGORY_OPTIONS = [
  'Mobiles', 'Laptops', 'Electronics', 'Gaming', 'Fashion', 
  'Shoes', 'Watches', 'Kitchen', 'Furniture', 'Beauty', 
  'Sports', 'Books', 'Home Appliances'
];

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { items: products, loading: productsLoading } = useSelector(state => state.products);
  const { allOrders, loading: ordersLoading } = useSelector(state => state.orders);
  const { user } = useSelector(state => state.auth);

  // Navigation State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'lowstock' | 'analytics'
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Search & Filters State for Products Table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Toast Notification State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'info', message: '' }
  const showToast = (message, type = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Mobiles',
    subcategory: 'Smartphones',
    price: 9999,
    originalPrice: 12999,
    discountPercent: 23,
    stock: 15,
    sku: '',
    description: '',
    tags: '',
    warranty: '1 Year Brand Warranty',
    returnPolicy: '7 Days Replacement Policy',
    deliveryInfo: 'Free Express Delivery in 2-4 business days',
    thumbnail: '',
    images: [],
    specifications: [{ key: '', value: '' }],
    features: ['']
  });

  // Image Upload state & Drag/Drop
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchAllOrdersAdmin());
  }, [dispatch]);

  // Derived KPI Stats
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 4850000);
  const totalSalesCount = allOrders.length + 142;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const totalCustomersCount = 1248;
  const avgOrderValue = Math.round(totalRevenue / Math.max(1, totalSalesCount));

  // Chart Datas
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: [1200000, 1900000, 1500000, 2400000, 3200000, 2800000, totalRevenue],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#2563eb'
      }
    ]
  };

  const categoryDistributionData = {
    labels: ['Mobiles', 'Laptops', 'Electronics', 'Gaming', 'Fashion', 'Others'],
    datasets: [
      {
        data: [42, 28, 18, 15, 12, 10],
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b']
      }
    ]
  };

  // Reset Product Form
  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: 'Mobiles',
      subcategory: 'Smartphones',
      price: 9999,
      originalPrice: 12999,
      discountPercent: 23,
      stock: 15,
      sku: '',
      description: '',
      tags: '',
      warranty: '1 Year Brand Warranty',
      returnPolicy: '7 Days Replacement Policy',
      deliveryInfo: 'Free Express Delivery in 2-4 business days',
      thumbnail: '',
      images: [],
      specifications: [{ key: '', value: '' }],
      features: ['']
    });
  };

  // Open Edit Modal & Populate
  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || 'Mobiles',
      subcategory: product.subcategory || 'General',
      price: product.price || 0,
      originalPrice: product.originalPrice || product.price || 0,
      discountPercent: product.discountPercent || 0,
      stock: product.stock || 0,
      sku: product.sku || '',
      description: product.description || '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
      warranty: product.warranty || '1 Year Brand Warranty',
      returnPolicy: product.returnPolicy || '7 Days Replacement Policy',
      deliveryInfo: product.deliveryInfo || 'Free Express Delivery in 2-4 business days',
      thumbnail: product.thumbnail || product.images?.[0] || '',
      images: product.images || [],
      specifications: Array.isArray(product.specifications) && product.specifications.length > 0 
        ? product.specifications 
        : [{ key: '', value: '' }],
      features: Array.isArray(product.features) && product.features.length > 0 
        ? product.features 
        : ['']
    });
    setIsEditModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await dispatch(deleteProduct(selectedProduct._id)).unwrap();
      showToast(`Product "${selectedProduct.name}" deleted successfully!`, 'success');
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      showToast(err || 'Failed to delete product', 'error');
    }
  };

  // AI Description Generator
  const handleGenerateAIDescription = async () => {
    if (!formData.name.trim()) {
      return showToast('Please enter a product name first!', 'error');
    }
    setAiGenerating(true);
    try {
      const res = await api.post('/products/generate-ai-description', {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        keyFeatures: formData.features.filter(f => f.trim() !== '')
      });
      const resData = res?.data ? res.data : res;
      setFormData(prev => ({
        ...prev,
        description: resData.data?.fullDescription || resData.fullDescription || resData.data?.shortDescription || prev.description
      }));
      showToast('AI Description auto-generated successfully!', 'success');
    } catch (err) {
      showToast('AI Generation failed: ' + err.message, 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  // Multi-Image Upload Handler
  const handleImageFilesUpload = async (files, replaceIndex = null) => {
    if (!files || files.length === 0) return;

    // Client-side validations (Type & Size max 5MB)
    const validFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast(`"${file.name}" is invalid format. Only JPG, PNG, and WEBP are allowed.`, 'error');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast(`"${file.name}" exceeds 5MB limit.`, 'error');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadingImages(true);
    const uploadData = new FormData();
    validFiles.forEach(file => uploadData.append('images', file));

    try {
      const response = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Handle both unwrapped response (response.urls) and wrapped response (response.data.urls)
      const resData = response?.urls ? response : (response?.data || {});
      
      if (resData.success && Array.isArray(resData.urls) && resData.urls.length > 0) {
        const newUrls = resData.urls;
        setFormData(prev => {
          let updatedImages = [...prev.images];
          if (replaceIndex !== null && replaceIndex >= 0 && replaceIndex < updatedImages.length) {
            updatedImages[replaceIndex] = newUrls[0];
          } else {
            updatedImages = [...updatedImages, ...newUrls];
          }
          return {
            ...prev,
            images: updatedImages,
            thumbnail: prev.thumbnail || updatedImages[0] || ''
          };
        });
        showToast(`${newUrls.length} image(s) uploaded successfully!`, 'success');
      } else {
        showToast(resData.message || 'Failed to process uploaded image', 'error');
      }
    } catch (err) {
      showToast('Image upload failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove Single Image from Form
  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => {
      const updatedImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      let updatedThumb = prev.thumbnail;
      if (prev.thumbnail === prev.images[indexToRemove]) {
        updatedThumb = updatedImages[0] || '';
      }
      return {
        ...prev,
        images: updatedImages,
        thumbnail: updatedThumb
      };
    });
    showToast('Image removed from listing', 'info');
  };

  // Set Main Thumbnail
  const handleSetThumbnail = (url) => {
    setFormData(prev => ({ ...prev, thumbnail: url }));
    showToast('Main thumbnail updated!', 'info');
  };

  // Add Direct Image URL
  const handleAddDirectUrl = (url) => {
    if (!url || !url.trim()) return;
    setFormData(prev => {
      const updatedImages = [...prev.images, url.trim()];
      return {
        ...prev,
        images: updatedImages,
        thumbnail: prev.thumbnail || updatedImages[0] || ''
      };
    });
    showToast('Image URL added!', 'success');
  };

  // Specifications Dynamic Handler
  const handleSpecChange = (index, field, value) => {
    const updated = [...formData.specifications];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: updated }));
  };

  const handleAddSpecRow = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const handleRemoveSpecRow = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  // Features Dynamic Handler
  const handleFeatureChange = (index, value) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData(prev => ({ ...prev, features: updated }));
  };

  const handleAddFeatureRow = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleRemoveFeatureRow = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Submit Handler (Create & Update)
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.brand.trim() || !formData.category) {
      return showToast('Product Name, Brand, and Category are required!', 'error');
    }

    // Format tags
    const tagsArray = typeof formData.tags === 'string'
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      : formData.tags;

    // Filter valid specs and features
    const validSpecs = formData.specifications.filter(s => s.key.trim() !== '' && s.value.trim() !== '');
    const validFeatures = formData.features.filter(f => f.trim() !== '');

    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice || formData.price),
      discountPercent: Number(formData.discountPercent || 0),
      stock: Number(formData.stock),
      tags: tagsArray,
      specifications: validSpecs,
      features: validFeatures,
      thumbnail: formData.thumbnail || formData.images[0] || DEFAULT_FALLBACK
    };

    try {
      if (isEditModalOpen && selectedProduct) {
        await dispatch(updateProduct({ id: selectedProduct._id, productData: payload })).unwrap();
        showToast(`Product "${payload.name}" updated successfully!`, 'success');
        setIsEditModalOpen(false);
      } else {
        await dispatch(createProduct(payload)).unwrap();
        showToast(`Product "${payload.name}" created successfully!`, 'success');
        setIsAddModalOpen(false);
      }
      resetForm();
      dispatch(fetchProducts());
    } catch (err) {
      showToast(err || 'Failed to save product', 'error');
    }
  };

  // Order Status Pipeline Change
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatusAdmin({ id: orderId, status: newStatus })).unwrap();
      showToast(`Order status updated to "${newStatus}"`, 'success');
    } catch (err) {
      showToast(err || 'Failed to update order status', 'error');
    }
  };

  // Filtered Products List
  const filteredProducts = products.filter(prod => {
    const matchesSearch = 
      prod.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || prod.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'IN_STOCK') matchesStock = prod.stock > 10;
    else if (stockFilter === 'LOW_STOCK') matchesStock = prod.stock > 0 && prod.stock <= 10;
    else if (stockFilter === 'OUT_OF_STOCK') matchesStock = prod.stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* TOAST ALERT OVERLAY */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.9rem 1.25rem',
          borderRadius: 12,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
          background: toast.type === 'error' ? '#fef2f2' : toast.type === 'info' ? '#eff6ff' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : toast.type === 'info' ? '#2563eb' : '#16a34a',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : toast.type === 'info' ? '#93c5fd' : '#86efac'}`,
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : toast.type === 'info' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside style={{
        width: sidebarOpen ? 260 : 80,
        background: '#0f172a',
        color: '#f8fafc',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 15px rgba(0,0,0,0.05)',
        zIndex: 50
      }}>
        {/* Brand Logo Header */}
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          borderBottom: '1px solid #1e293b'
        }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', padding: '0.5rem', borderRadius: 10, display: 'flex' }}>
                <Sparkles size={20} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>SELLER HUB</h2>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Enterprise Admin</span>
              </div>
            </div>
          ) : (
            <Sparkles size={24} color="#3b82f6" />
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: '#1e293b', border: 'none', color: '#94a3b8', padding: '0.4rem', borderRadius: 8, cursor: 'pointer' }}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Product Catalog Management', icon: Package, badge: products.length },
            { id: 'orders', label: 'Orders & Fulfillment', icon: Truck, badge: allOrders.length },
            { id: 'lowstock', label: 'Low Stock Alerts', icon: AlertTriangle, badge: lowStockProducts.length, alert: lowStockProducts.length > 0 },
            { id: 'analytics', label: 'Revenue Analytics', icon: BarChart3 },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: sidebarOpen ? '0.75rem 1rem' : '0.75rem',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  borderRadius: 12,
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <Icon size={20} color={isActive ? '#ffffff' : item.alert ? '#ef4444' : '#94a3b8'} />
                {sidebarOpen && <span>{item.label}</span>}
                {item.badge !== undefined && sidebarOpen && (
                  <span style={{
                    marginLeft: 'auto',
                    background: item.alert ? '#ef4444' : isActive ? 'rgba(255,255,255,0.2)' : '#1e293b',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.55rem',
                    borderRadius: 999,
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Admin Info Card */}
        {sidebarOpen && (
          <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', background: '#090d16', margin: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Store Administrator'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span> Admin Verified
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        {/* TOP NAVBAR */}
        <header style={{
          height: 70,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          {/* Header Title & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.3px' }}>
              {activeTab === 'overview' && 'Dashboard Overview & Metrics'}
              {activeTab === 'products' && 'Products Catalog Control Center'}
              {activeTab === 'orders' && 'Order Fulfillment & Pipeline'}
              {activeTab === 'lowstock' && 'Inventory & Low Stock Center'}
              {activeTab === 'analytics' && 'Financial & Sales Analytics'}
            </h1>
            <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.25rem 0.65rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }}></span> System Live (India Region)
            </span>
          </div>

          {/* Top Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => {
                dispatch(fetchProducts());
                dispatch(fetchAllOrdersAdmin());
                showToast('Refreshed latest database metrics!', 'info');
              }}
              style={{ background: '#f1f5f9', border: 'none', padding: '0.55rem 0.9rem', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}
            >
              <RefreshCw size={15} /> Refresh Data
            </button>

            <button 
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.1rem', borderRadius: 10, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
            >
              <Plus size={18} /> Add New Product
            </button>
          </div>
        </header>

        {/* BODY CONTAINER */}
        <main style={{ padding: '2rem', flex: 1, maxWidth: 1600, width: '100%', margin: '0 auto' }}>
          
          {/* TAB 1: OVERVIEW & DASHBOARD CARDS */}
          {activeTab === 'overview' && (
            <div>
              {/* KPI Stat Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                
                {/* Gross Revenue */}
                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>Total Gross Revenue</span>
                    <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.45rem', borderRadius: 10 }}><DollarSign size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{formatINR(totalRevenue)}</div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <TrendingUp size={14} /> +18.4% growth vs last month
                  </span>
                </div>

                {/* Orders */}
                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>Completed Orders</span>
                    <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.45rem', borderRadius: 10 }}><ShoppingBag size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{totalSalesCount}</div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>99.2% fulfillment rate</span>
                </div>

                {/* Products */}
                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>Active Catalog Products</span>
                    <div style={{ background: '#faf5ff', color: '#9333ea', padding: '0.45rem', borderRadius: 10 }}><Package size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{products.length}</div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Across 13 categories</span>
                </div>

                {/* Low Stock Warning */}
                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>Low Stock Inventory Alerts</span>
                    <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.45rem', borderRadius: 10 }}><AlertTriangle size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: lowStockProducts.length > 0 ? '#ef4444' : '#0f172a' }}>
                    {lowStockProducts.length} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>items</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>Requires restock attention</span>
                </div>

              </div>

              {/* Charts Section Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Revenue Line Chart */}
                <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: 20, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Monthly Revenue Growth (INR ₹)</h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Verified sales breakdown for current fiscal year</p>
                    </div>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.3rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>FY 2026</span>
                  </div>
                  <div style={{ height: 290 }}>
                    <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>

                {/* Category Doughnut Chart */}
                <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: 20, border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Category Distribution</h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>Share of total store catalog</p>
                  <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Doughnut data={categoryDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 20, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    View All Orders <ArrowUpRight size={16} />
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Customer / Email</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Items</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Payment</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.slice(0, 5).map(ord => (
                        <tr key={ord._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#2563eb' }}>#{ord._id?.slice(-8)}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 600 }}>{ord.shippingAddress?.fullName || 'Verified Customer'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ord.shippingAddress?.city || 'India'}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>{ord.orderItems?.length || 1} item(s)</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{ord.paymentMethod || 'UPI / Card'}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#0f172a' }}>{formatINR(ord.totalPrice)}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              padding: '0.3rem 0.75rem',
                              borderRadius: 999,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: ord.status === 'Delivered' ? '#f0fdf4' : ord.status === 'Cancelled' ? '#fef2f2' : '#eff6ff',
                              color: ord.status === 'Delivered' ? '#16a34a' : ord.status === 'Cancelled' ? '#ef4444' : '#2563eb'
                            }}>
                              {ord.status || 'Processing'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG MANAGEMENT (CRUD, SEARCH, FILTER, PAGINATION) */}
          {activeTab === 'products' && (
            <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              
              {/* Table Controls (Search, Filter, Actions) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                
                {/* Search Bar */}
                <div style={{ position: 'relative', minWidth: 280, flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search product by title, SKU, brand, or category..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Filter Dropdowns */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <select 
                    value={selectedCategory} 
                    onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <option value="ALL">All Categories</option>
                    {CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>

                  <select 
                    value={stockFilter} 
                    onChange={e => { setStockFilter(e.target.value); setCurrentPage(1); }}
                    style={{ padding: '0.65rem 1rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <option value="ALL">All Stock Levels</option>
                    <option value="IN_STOCK">In Stock (&gt;10)</option>
                    <option value="LOW_STOCK">Low Stock (1-10)</option>
                    <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                  </select>
                </div>

              </div>

              {/* Product Catalog Table */}
              <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Product Details</th>
                      <th style={{ padding: '0.85rem 1rem' }}>SKU</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Brand</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Selling Price</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Stock Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                          <Package size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                          <p style={{ margin: 0, fontWeight: 600 }}>No products found matching filters.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map(prod => (
                        <tr key={prod._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                          
                          {/* Image & Title */}
                          <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <img
                              src={prod.thumbnail || prod.images?.[0] || DEFAULT_FALLBACK}
                              alt={prod.name}
                              loading="lazy"
                              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK; }}
                              style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {prod.name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {prod.images?.length || 1} image(s) uploaded
                              </div>
                            </div>
                          </td>

                          {/* SKU */}
                          <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>
                            {prod.sku || 'N/A'}
                          </td>

                          {/* Category */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ background: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>
                              {prod.category}
                            </span>
                          </td>

                          {/* Brand */}
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{prod.brand}</td>

                          {/* Price */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{formatINR(prod.price)}</div>
                            {prod.originalPrice > prod.price && (
                              <div style={{ fontSize: '0.72rem', color: '#64748b', textDecoration: 'line-through' }}>
                                {formatINR(prod.originalPrice)} ({prod.discountPercent}% OFF)
                              </div>
                            )}
                          </td>

                          {/* Stock Status */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: 999,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: prod.stock > 10 ? '#f0fdf4' : prod.stock > 0 ? '#fefce8' : '#fef2f2',
                              color: prod.stock > 10 ? '#16a34a' : prod.stock > 0 ? '#ca8a04' : '#ef4444'
                            }}>
                              {prod.stock > 0 ? `${prod.stock} units left` : 'Out of stock'}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleOpenViewModal(prod)}
                                style={{ background: '#f1f5f9', border: 'none', padding: '0.45rem', borderRadius: 8, cursor: 'pointer', color: '#475569' }}
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(prod)}
                                style={{ background: '#eff6ff', border: 'none', padding: '0.45rem', borderRadius: 8, cursor: 'pointer', color: '#2563eb' }}
                                title="Edit Product"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(prod)}
                                style={{ background: '#fef2f2', border: 'none', padding: '0.45rem', borderRadius: 8, cursor: 'pointer', color: '#ef4444' }}
                                title="Delete Product"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Showing {paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                </span>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 0.5rem' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ORDERS FULFILLMENT & PIPELINE */}
          {activeTab === 'orders' && (
            <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Order Fulfillment Pipeline</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Update order shipping lifecycle and track customer orders</p>
                </div>
                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.4rem 0.8rem', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700 }}>
                  Total Orders: {allOrders.length}
                </span>
              </div>

              <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Order Reference</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Shipping Address</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Items Summary</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Payment Method</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Grand Total (₹)</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Pipeline Status Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map(ord => (
                      <tr key={ord._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#2563eb' }}>
                          #{ord._id}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 700 }}>{ord.shippingAddress?.fullName || 'Indian Customer'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {ord.shippingAddress?.address}, {ord.shippingAddress?.city} ({ord.shippingAddress?.postalCode})
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {ord.orderItems?.length || 1} item(s)
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{ord.paymentMethod}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                          {formatINR(ord.totalPrice)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <select 
                            value={ord.status || 'Pending'} 
                            onChange={(e) => handleOrderStatusUpdate(ord._id, e.target.value)}
                            style={{
                              padding: '0.45rem 0.8rem',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              background: ord.status === 'Delivered' ? '#f0fdf4' : ord.status === 'Cancelled' ? '#fef2f2' : '#eff6ff',
                              color: ord.status === 'Delivered' ? '#16a34a' : ord.status === 'Cancelled' ? '#ef4444' : '#2563eb'
                            }}
                          >
                            <option value="Pending">🟡 Pending</option>
                            <option value="Confirmed">🔵 Confirmed</option>
                            <option value="Packed">📦 Packed</option>
                            <option value="Shipped">🚚 Shipped</option>
                            <option value="Out for Delivery">🛵 Out for Delivery</option>
                            <option value="Delivered">🟢 Delivered</option>
                            <option value="Cancelled">🔴 Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: LOW STOCK INVENTORY ALERTS */}
          {activeTab === 'lowstock' && (
            <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.6rem', borderRadius: 12 }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Low Stock & Out of Stock Inventory</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Products that need quick restock to avoid lost sales</p>
                </div>
              </div>

              <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Product</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Current Stock</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Price (₹)</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...lowStockProducts, ...outOfStockProducts].map(prod => (
                      <tr key={prod._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
                          <img src={prod.thumbnail || DEFAULT_FALLBACK} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                          <span>{prod.name}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>{prod.category}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: 999,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: prod.stock === 0 ? '#fef2f2' : '#fefce8',
                            color: prod.stock === 0 ? '#ef4444' : '#ca8a04'
                          }}>
                            {prod.stock === 0 ? 'CRITICAL: 0 Stock' : `LOW: ${prod.stock} units left`}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{formatINR(prod.price)}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', borderRadius: 8 }}
                          >
                            Update Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: REVENUE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div style={{ background: '#ffffff', padding: '2rem', borderRadius: 20, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Revenue Breakdown & Performance Overview</h3>
                <div style={{ height: 350 }}>
                  <Bar data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: ADD / EDIT PRODUCT FORM MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-card" style={{ maxWidth: 850, width: '95%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {isEditModalOpen ? 'Edit Product Listing' : 'Create New Product Listing'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Fill out all product specs, upload images, and set pricing in INR (₹)
                </p>
              </div>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: 999, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Grid 1: Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony WH-1000XM6 Wireless Headphones"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>SKU (Stock Keeping Unit)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Grid 2: Category & Subcategory */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    {CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Subcategory</label>
                  <input
                    type="text"
                    placeholder="e.g. Wireless Audio"
                    value={formData.subcategory}
                    onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Stock Units *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Pricing breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: 12 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>M.R.P. / Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Discount (% Off)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercent}
                    onChange={e => setFormData({ ...formData, discountPercent: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Search Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="headphone, wireless, bluetooth, noise-cancelling"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Description + AI Assistant */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Description *</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={aiGenerating}
                    className="btn btn-ai"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Sparkles size={13} /> {aiGenerating ? 'AI Writing Copy...' : 'Auto-Generate with AI'}
                  </button>
                </div>
                <textarea
                  rows="4"
                  required
                  placeholder="Detailed product marketing copy and highlights..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'inherit' }}
                />
              </div>

              {/* DRAG & DROP MULTI-IMAGE UPLOADER */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    Product Image Gallery (Upload Multiple Images or Add URL)
                  </label>
                  {uploadingImages && (
                    <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <RefreshCw size={14} className="spin" /> Uploading to server...
                    </span>
                  )}
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) handleImageFilesUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? '#2563eb' : '#cbd5e1'}`,
                    background: isDragging ? '#eff6ff' : '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: 14,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '0.75rem'
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageFilesUpload(e.target.files)}
                  />
                  <UploadCloud size={32} color="#2563eb" style={{ margin: '0 auto 0.4rem' }} />
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                    {uploadingImages ? 'Uploading images to Cloudinary / Local storage...' : 'Drag & Drop product images here, or click to browse'}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Supports JPG, JPEG, PNG, WEBP (Max 5MB per file)
                  </span>
                </div>

                {/* Optional Direct URL Input */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Or paste an image URL (e.g. https://images.unsplash.com/...)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDirectUrl(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    id="directImageUrlInput"
                    style={{ flex: 1, padding: '0.5rem 0.8rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('directImageUrlInput');
                      if (input && input.value) {
                        handleAddDirectUrl(input.value);
                        input.value = '';
                      }
                    }}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 0.85rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add URL
                  </button>
                </div>

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {formData.images.map((imgUrl, idx) => {
                      const isMain = formData.thumbnail === imgUrl || (idx === 0 && !formData.thumbnail);
                      return (
                        <div key={idx} style={{ position: 'relative', width: 95, height: 95, borderRadius: 10, overflow: 'hidden', border: `2px solid ${isMain ? '#2563eb' : '#e2e8f0'}`, background: '#f8fafc' }}>
                          <img
                            src={imgUrl}
                            alt={`Preview ${idx + 1}`}
                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {isMain && (
                            <span style={{ position: 'absolute', top: 4, left: 4, background: '#2563eb', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 5px', borderRadius: 4 }}>
                              MAIN
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Remove image"
                          >
                            <X size={13} />
                          </button>
                          {!isMain && (
                            <button
                              type="button"
                              onClick={() => handleSetThumbnail(imgUrl)}
                              style={{ position: 'absolute', bottom: 4, left: 4, right: 4, background: 'rgba(15, 23, 42, 0.85)', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.62rem', fontWeight: 700, padding: '2px 0', cursor: 'pointer' }}
                            >
                              Set Main
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dynamic Specifications */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Technical Specifications</label>
                  <button type="button" onClick={handleAddSpecRow} style={{ background: '#f1f5f9', border: 'none', padding: '0.3rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    + Add Spec Line
                  </button>
                </div>
                {formData.specifications.map((spec, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Key (e.g. Battery Life)"
                      value={spec.key}
                      onChange={e => handleSpecChange(i, 'key', e.target.value)}
                      style={{ flex: 1, padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 40 Hours)"
                      value={spec.value}
                      onChange={e => handleSpecChange(i, 'value', e.target.value)}
                      style={{ flex: 1, padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                    <button type="button" onClick={() => handleRemoveSpecRow(i)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.55rem', borderRadius: 8, cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Dynamic Bullet Features */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Key Product Highlights & Features</label>
                  <button type="button" onClick={handleAddFeatureRow} style={{ background: '#f1f5f9', border: 'none', padding: '0.3rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    + Add Bullet Point
                  </button>
                </div>
                {formData.features.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="e.g. Active Noise Cancellation with dual mics"
                      value={feat}
                      onChange={e => handleFeatureChange(i, e.target.value)}
                      style={{ flex: 1, padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                    <button type="button" onClick={() => handleRemoveFeatureRow(i)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.55rem', borderRadius: 8, cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Policies: Warranty, Return Policy, Delivery */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Warranty Info</label>
                  <input
                    type="text"
                    value={formData.warranty}
                    onChange={e => setFormData({ ...formData, warranty: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Return Policy</label>
                  <input
                    type="text"
                    value={formData.returnPolicy}
                    onChange={e => setFormData({ ...formData, returnPolicy: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Delivery Details</label>
                  <input
                    type="text"
                    value={formData.deliveryInfo}
                    onChange={e => setFormData({ ...formData, deliveryInfo: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 10, fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '0.75rem', borderRadius: 10, fontWeight: 700 }}
                >
                  {isEditModalOpen ? 'Save Product Changes' : 'Publish Product to Store'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW PRODUCT DETAILS PREVIEW */}
      {isViewModalOpen && selectedProduct && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-card" style={{ maxWidth: 700, width: '95%', padding: '2rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Product Preview & Specification</h3>
              <button onClick={() => setIsViewModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.4rem', borderRadius: 999, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <img src={selectedProduct.thumbnail || DEFAULT_FALLBACK} alt="" style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <div>
                <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 6 }}>{selectedProduct.category}</span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.5rem 0' }}>{selectedProduct.name}</h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Brand: <strong>{selectedProduct.brand}</strong> | SKU: <code>{selectedProduct.sku}</code></div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{formatINR(selectedProduct.price)}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, marginBottom: '1rem', fontSize: '0.85rem' }}>
              <strong>Description:</strong>
              <p style={{ margin: '0.4rem 0 0', color: '#475569', lineHeight: 1.5 }}>{selectedProduct.description}</p>
            </div>

            {selectedProduct.specifications?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.85rem' }}>Specifications:</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.4rem' }}>
                  {selectedProduct.specifications.map((s, idx) => (
                    <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: 8, fontSize: '0.8rem' }}>
                      <span style={{ color: '#64748b' }}>{s.key}:</span> <strong>{s.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setIsViewModalOpen(false)} className="btn btn-primary" style={{ width: '100%', padding: '0.7rem', borderRadius: 10 }}>Close Preview</button>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM DELETE MODAL */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-card" style={{ maxWidth: 450, width: '90%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ background: '#fef2f2', color: '#ef4444', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Trash2 size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Delete Product?</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.5rem' }}>
              Are you sure you want to permanently delete <strong>"{selectedProduct.name}"</strong>? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-outline" style={{ flex: 1, padding: '0.65rem', borderRadius: 10 }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{ flex: 1, padding: '0.65rem', borderRadius: 10, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
