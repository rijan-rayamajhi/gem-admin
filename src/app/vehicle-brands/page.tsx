'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/HomeLayout';
import { vehicleBrandService, VehicleBrand } from '@/lib/vehicleBrandService';
import { vehicleBrandRequestService, VehicleBrandRequest } from '@/lib/vehicleBrandRequestService';
import { brandRequestService, BrandRequest } from '@/lib/brandRequestService';
import { modelRequestService, ModelRequest } from '@/lib/modelRequestService';
import AddVehicleBrandModal from '@/components/AddVehicleBrandModal';
import BrandRequestModal from '@/components/BrandRequestModal';
import Notification from '@/components/Notification';

export default function VehicleBrandsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'brands' | 'brand-requests' | 'model-requests'>('brands');
  
  // Brands state
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Brand Requests state (from brandRequestService)
  const [newBrandRequests, setNewBrandRequests] = useState<BrandRequest[]>([]);
  const [filteredNewBrandRequests, setFilteredNewBrandRequests] = useState<BrandRequest[]>([]);
  const [newBrandRequestsLoading, setNewBrandRequestsLoading] = useState(true);
  const [isNewBrandRequestModalOpen, setIsNewBrandRequestModalOpen] = useState(false);
  
  // Existing Requests state
  const [requests, setRequests] = useState<VehicleBrandRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VehicleBrandRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  
  // Model Requests state
  const [modelRequests, setModelRequests] = useState<ModelRequest[]>([]);
  const [filteredModelRequests, setFilteredModelRequests] = useState<ModelRequest[]>([]);
  const [modelRequestsLoading, setModelRequestsLoading] = useState(true);
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  useEffect(() => {
    if (activeTab === 'brands') {
    loadVehicleBrands();
    } else if (activeTab === 'brand-requests') {
      loadRequests();
      loadNewBrandRequests();
    } else if (activeTab === 'model-requests') {
      loadModelRequests();
    }
  }, [activeTab]);

  const loadVehicleBrands = async () => {
    try {
      setBrandsLoading(true);
      const brands = await vehicleBrandService.getVehicleBrands();
      setVehicleBrands(brands);
    } catch (error) {
      console.error('Error loading vehicle brands:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load vehicle brands',
        isVisible: true,
      });
    } finally {
      setBrandsLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setRequestsLoading(true);
      const allRequests = await vehicleBrandRequestService.getVehicleBrandRequests();
      setRequests(allRequests);
      setFilteredRequests(allRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load requests',
        isVisible: true,
      });
    } finally {
      setRequestsLoading(false);
    }
  };

  const loadModelRequests = async () => {
    try {
      setModelRequestsLoading(true);
      const allModelRequests = await modelRequestService.getModelRequests();
      setModelRequests(allModelRequests);
      setFilteredModelRequests(allModelRequests);
    } catch (error) {
      console.error('Error loading model requests:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load model requests',
        isVisible: true,
      });
    } finally {
      setModelRequestsLoading(false);
    }
  };

  const loadNewBrandRequests = async () => {
    try {
      setNewBrandRequestsLoading(true);
      const allNewBrandRequests = await brandRequestService.getBrandRequests();
      setNewBrandRequests(allNewBrandRequests);
      setFilteredNewBrandRequests(allNewBrandRequests);
    } catch (error) {
      console.error('Error loading new brand requests:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load brand requests',
        isVisible: true,
      });
    } finally {
      setNewBrandRequestsLoading(false);
    }
  };

  const handleAddSuccess = () => {
    loadVehicleBrands(); // Reload the list after adding
  };

  // Filter requests based on search and filters
  useEffect(() => {
    if (activeTab === 'brand-requests') {
      let filtered = requests.filter((request) => request.type === 'brand');

      // Search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter((request) =>
          request.brandName?.toLowerCase().includes(searchLower) ||
          request.userName.toLowerCase().includes(searchLower) ||
          request.userEmail.toLowerCase().includes(searchLower) ||
          request.description.toLowerCase().includes(searchLower)
        );
      }

      // Status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter((request) => request.status === statusFilter);
      }

      setFilteredRequests(filtered);
    } else if (activeTab === 'model-requests') {
      let filtered = modelRequests;

      // Search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter((request) =>
          request.brandName.toLowerCase().includes(searchLower) ||
          request.modelName.toLowerCase().includes(searchLower) ||
          request.userId.toLowerCase().includes(searchLower)
        );
      }

      // Status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter((request) => request.status === statusFilter);
      }

      setFilteredModelRequests(filtered);
    }
    
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, activeTab, requests, modelRequests]);

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getCategoryColor = (vehicleType: string) => {
    const colors: { [key: string]: string } = {
      'two_wheeler': 'bg-blue-100 text-blue-800',
      'four_wheeler': 'bg-green-100 text-green-800',
      'two_wheeler_electric': 'bg-yellow-100 text-yellow-800',
      'four_wheeler_electric': 'bg-purple-100 text-purple-800',
    };
    return colors[vehicleType] || 'bg-gray-100 text-gray-800';
  };

  const formatVehicleType = (vehicleType: string) => {
    const displayNames: { [key: string]: string } = {
      'two_wheeler': 'Two Wheeler',
      'four_wheeler': 'Four Wheeler',
      'two_wheeler_electric': 'Two Wheeler Electric',
      'four_wheeler_electric': 'Four Wheeler Electric',
    };
    return displayNames[vehicleType] || vehicleType;
  };

  const getRequestStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };



  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApproveRequest = async (request: VehicleBrandRequest) => {
    try {
      setActionLoading(request.id);

      if (request.type === 'brand') {
        // Add new brand to vehicle brands
        await vehicleBrandService.addVehicleBrand({
          name: request.brandName!,
          status: 'Active',
          models: [],
          vehicleType: request.vehicleType,
          logoUrl: '',
        });
      } else if (request.type === 'model') {
        // Find existing brand and add model to it
        const brands = await vehicleBrandService.getVehicleBrands();
        const existingBrand = brands.find(brand => 
          brand.name.toLowerCase() === request.brandName?.toLowerCase()
        );

        if (existingBrand) {
          const newModel = {
            id: Date.now().toString(),
            name: request.modelName!,
          };

          await vehicleBrandService.updateVehicleBrand(existingBrand.id!, {
            models: [...existingBrand.models, newModel]
          });
        } else {
          throw new Error('Brand not found');
        }
      }

      // Update request status to approved
      await vehicleBrandRequestService.updateRequestStatus(
        request.id, 
        'approved', 
        `Approved by ${user?.email || 'admin'}`
      );

      setNotification({
        type: 'success',
        message: `${request.type === 'brand' ? 'Brand' : 'Model'} request approved and added successfully!`,
        isVisible: true,
      });

      // Reload requests and brands
      await loadRequests();
      await loadVehicleBrands();

    } catch (error) {
      console.error('Error approving request:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to approve request',
        isVisible: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (request: VehicleBrandRequest, notes?: string) => {
    try {
      setActionLoading(request.id);

      const rejectionNotes = notes || `Rejected by ${user?.email || 'admin'}`;
      
      // If the request was previously approved, remove the brand from admin_data
      if (request.status === 'approved' && request.type === 'brand') {
        try {
          // Find and remove the brand from vehicle brands
          const brands = await vehicleBrandService.getVehicleBrands();
          const brandToRemove = brands.find(brand => 
            brand.name.toLowerCase() === request.brandName?.toLowerCase()
          );
          
          if (brandToRemove) {
            await vehicleBrandService.deleteVehicleBrand(brandToRemove.id!);
          }
        } catch (error) {
          console.error('Error removing brand from admin_data:', error);
          // Continue with rejection even if removal fails
        }
      }

      await vehicleBrandRequestService.updateRequestStatus(
        request.id, 
        'rejected', 
        rejectionNotes
      );

      setNotification({
        type: 'success',
        message: 'Request rejected successfully!',
        isVisible: true,
      });

      // Reload requests and brands
      await loadRequests();
      await loadVehicleBrands();

    } catch (error) {
      console.error('Error rejecting request:', error);
      setNotification({
        type: 'error',
        message: 'Failed to reject request',
        isVisible: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getRequestStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const getModelRequestStats = () => {
    const total = modelRequests.length;
    const pending = modelRequests.filter(r => r.status === 'pending').length;
    const approved = modelRequests.filter(r => r.status === 'approved').length;
    const rejected = modelRequests.filter(r => r.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const getCombinedBrandRequestStats = () => {
    const oldBrandRequests = requests.filter(r => r.type === 'brand');
    const newBrandRequestsData = newBrandRequests;
    
    const total = oldBrandRequests.length + newBrandRequestsData.length;
    const pending = oldBrandRequests.filter((r: VehicleBrandRequest) => r.status === 'pending').length + 
                   newBrandRequestsData.filter((r: BrandRequest) => r.status === 'pending').length;
    const approved = oldBrandRequests.filter((r: VehicleBrandRequest) => r.status === 'approved').length + 
                    newBrandRequestsData.filter((r: BrandRequest) => r.status === 'approved').length;
    const rejected = oldBrandRequests.filter((r: VehicleBrandRequest) => r.status === 'rejected').length + 
                    newBrandRequestsData.filter((r: BrandRequest) => r.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const handleApproveNewBrandRequest = async (request: BrandRequest) => {
    try {
      setActionLoading(request.id!);

      // Add new brand to vehicle brands
      await vehicleBrandService.addVehicleBrand({
        name: request.brandName,
        status: 'Active',
        models: request.vehicleModels.map(model => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: model,
        })),
        vehicleType: request.vehicleType,
        logoUrl: request.imageUrl || '',
      });

      // Update request status to approved
      await brandRequestService.updateRequestStatus(
        request.id!, 
        'approved', 
        `Approved by ${user?.email || 'admin'}`,
        user?.email || 'admin'
      );

      setNotification({
        type: 'success',
        message: 'Brand request approved and added successfully!',
        isVisible: true,
      });

      // Reload requests and brands
      await loadNewBrandRequests();
      await loadVehicleBrands();

    } catch (error) {
      console.error('Error approving new brand request:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to approve request',
        isVisible: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectNewBrandRequest = async (request: BrandRequest, notes?: string) => {
    try {
      setActionLoading(request.id!);

      const rejectionNotes = notes || `Rejected by ${user?.email || 'admin'}`;
      
      // If the request was previously approved, remove the brand from admin_data
      if (request.status === 'approved') {
        try {
          // Find and remove the brand from vehicle brands
          const brands = await vehicleBrandService.getVehicleBrands();
          const brandToRemove = brands.find(brand => 
            brand.name.toLowerCase() === request.brandName.toLowerCase()
          );
          
          if (brandToRemove) {
            await vehicleBrandService.deleteVehicleBrand(brandToRemove.id!);
          }
        } catch (error) {
          console.error('Error removing brand from admin_data:', error);
          // Continue with rejection even if removal fails
        }
      }

      await brandRequestService.updateRequestStatus(
        request.id!, 
        'rejected', 
        rejectionNotes,
        user?.email || 'admin'
      );

      setNotification({
        type: 'success',
        message: 'Brand request rejected successfully!',
        isVisible: true,
      });

      // Reload requests and brands
      await loadNewBrandRequests();
      await loadVehicleBrands();

    } catch (error) {
      console.error('Error rejecting new brand request:', error);
      setNotification({
        type: 'error',
        message: 'Failed to reject request',
        isVisible: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveModelRequest = async (request: ModelRequest) => {
    try {
      setActionLoading(request.id);

      // Find existing brand and add model to it
      const brands = await vehicleBrandService.getVehicleBrands();
      const existingBrand = brands.find(brand => 
        brand.name.toLowerCase() === request.brandName.toLowerCase()
      );

      if (existingBrand) {
        const newModel = {
          id: Date.now().toString(),
          name: request.modelName,
        };

        await vehicleBrandService.updateVehicleBrand(existingBrand.id!, {
          models: [...existingBrand.models, newModel]
        });
      } else {
        throw new Error('Brand not found');
      }

      // Update request status to approved
      await modelRequestService.updateModelRequestStatus(
        request.id, 
        'approved', 
        `Approved by ${user?.email || 'admin'}`
      );

      setNotification({
        type: 'success',
        message: 'Model request approved and added successfully!',
        isVisible: true,
      });

      // Reload model requests and brands
      await loadModelRequests();
      await loadVehicleBrands();

    } catch (error) {
      console.error('Error approving model request:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to approve model request',
        isVisible: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectModelRequest = async (request: ModelRequest, notes?: string) => {
    try {
      setActionLoading(request.id);

      const rejectionNotes = notes || `Rejected by ${user?.email || 'admin'}`;
      
      // If the request was previously approved, remove the model from the brand
      if (request.status === 'approved') {
        try {
          // Find the brand and remove the model
          const brands = await vehicleBrandService.getVehicleBrands();
          const existingBrand = brands.find(brand => 
            brand.name.toLowerCase() === request.brandName.toLowerCase()
          );

          if (existingBrand) {
            const updatedModels = existingBrand.models.filter(model => 
              model.name.toLowerCase() !== request.modelName.toLowerCase()
            );

            await vehicleBrandService.updateVehicleBrand(existingBrand.id!, {
              models: updatedModels
            });
          }
        } catch (error) {
          console.error('Error removing model from brand:', error);
          // Continue with rejection even if removal fails
        }
      }

      await modelRequestService.updateModelRequestStatus(
        request.id, 
        'rejected', 
        rejectionNotes
      );

      setNotification({
        type: 'success',
        message: 'Model request rejected successfully!',
        isVisible: true,
      });

      // Reload model requests and brands
      await loadModelRequests();
      await loadVehicleBrands();

    } catch (error) {
      console.error('Error rejecting model request:', error);
      setNotification({
        type: 'error',
        message: 'Failed to reject model request',
        isVisible: true,
      });
    } finally {
      setActionLoading(null);
    }
  };


  const modelRequestStats = getModelRequestStats();
  const combinedBrandRequestStats = getCombinedBrandRequestStats();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vehicle Brands & Requests</h1>
              <p className="text-gray-600">Manage automotive brands and review brand/model requests</p>
            </div>
            <div className="flex space-x-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Add Brand
            </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('brands')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'brands'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vehicle Brands ({vehicleBrands.length})
              </button>
              <button
                onClick={() => setActiveTab('brand-requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'brand-requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Brand Requests ({combinedBrandRequestStats.total})
              </button>
              <button
                onClick={() => setActiveTab('model-requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'model-requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Model Requests ({modelRequestStats.total})
              </button>

            </nav>
          </div>

          {/* Stats Cards */}
          {activeTab === 'brands' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Brands</p>
                  <p className="text-2xl font-bold text-gray-900">{vehicleBrands.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Brands</p>
                  <p className="text-2xl font-bold text-gray-900">{vehicleBrands.filter(brand => brand.status === 'Active').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Models</p>
                  <p className="text-2xl font-bold text-gray-900">{vehicleBrands.reduce((sum, brand) => sum + brand.models.length, 0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Countries</p>
                  <p className="text-2xl font-bold text-gray-900">{new Set(vehicleBrands.map(brand => brand.country)).size}</p>
                </div>
              </div>
            </div>
          </div>
          ) : activeTab === 'brand-requests' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Brand Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{combinedBrandRequestStats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{combinedBrandRequestStats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{combinedBrandRequestStats.approved}</p>
              </div>
            </div>
          </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{combinedBrandRequestStats.rejected}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Model Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{modelRequestStats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{modelRequestStats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{modelRequestStats.approved}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{modelRequestStats.rejected}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {activeTab === 'brands' ? (
            /* Brands Tab Content */
            <>
              {brandsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : vehicleBrands.length === 0 ? (
                /* No Data State */
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicle brands found</h3>
                      <p className="text-gray-500 mb-6">Get started by adding your first vehicle brand to the system.</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 font-medium"
                      >
                        Add Your First Brand
                      </button>
                    </div>
                  </div>
            </div>
          ) : (
            /* Brands Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicleBrands.map((brand) => (
                <div key={brand.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center overflow-hidden">
                            {brand.logoUrl ? (
                              <img
                                src={brand.logoUrl}
                                alt={`${brand.name} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to initial if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <span className={`text-white text-lg font-bold ${brand.logoUrl ? 'hidden' : ''}`}>
                              {brand.name.charAt(0)}
                            </span>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(brand.status)}`}>
                        {brand.status}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{brand.name}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Brand ID:</span>
                        <span className="text-gray-900 font-mono">{brand.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Models:</span>
                        <span className="text-gray-900">{brand.models.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(brand.vehicleType)}`}>
                            {formatVehicleType(brand.vehicleType)}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                        <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </>
          ) : activeTab === 'brand-requests' ? (
            /* Requests Tab Content */
            <>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input
                      type="text"
                      placeholder={activeTab === 'brand-requests' ? "Search by brand name, user, or description..." : "Search by brand, model, user, or description..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Combined Brand Requests Table */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Brand Requests</h3>
                </div>
                {(requestsLoading || newBrandRequestsLoading) ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (filteredRequests.filter(r => r.type === 'brand').length === 0 && filteredNewBrandRequests.length === 0) ? (
                  <div className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No brand requests found</h3>
                      <p className="text-gray-500">
                        There are no brand requests at the moment.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Brand Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Old Brand Requests */}
                        {filteredRequests
                          .filter(r => r.type === 'brand')
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((request) => (
                          <tr key={`old-${request.id}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800`}>
                                    {formatVehicleType(request.vehicleType)}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900">{request.brandName}</div>
                                <div className="text-sm text-gray-500 mt-1">{request.description}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                                <div className="text-sm text-gray-500">{request.userEmail}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                Admin Request
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRequestStatusColor(request.status)}`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(request.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {request.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApproveRequest(request)}
                                    disabled={actionLoading === request.id}
                                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  >
                                    {actionLoading === request.id ? 'Approving...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const notes = prompt('Enter rejection reason (optional):');
                                      if (notes !== null) {
                                        handleRejectRequest(request, notes);
                                      }
                                    }}
                                    disabled={actionLoading === request.id}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  >
                                    {actionLoading === request.id ? 'Rejecting...' : 'Reject'}
                                  </button>
                                </div>
                              )}
                              {request.status === 'rejected' && (
                                <button
                                  onClick={() => handleApproveRequest(request)}
                                  disabled={actionLoading === request.id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                >
                                  {actionLoading === request.id ? 'Approving...' : 'Approve'}
                                </button>
                              )}
                              {request.status === 'approved' && (
                                <button
                                  onClick={() => {
                                    const notes = prompt('Enter rejection reason (optional):');
                                    if (notes !== null) {
                                      handleRejectRequest(request, notes);
                                    }
                                  }}
                                  disabled={actionLoading === request.id}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  {actionLoading === request.id ? 'Rejecting...' : 'Reject'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        
                        {/* New Brand Requests */}
                        {filteredNewBrandRequests
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((request) => (
                          <tr key={`new-${request.id}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-4">
                                {request.imageUrl && (
                                  <img
                                    src={request.imageUrl}
                                    alt={`${request.brandName} logo`}
                                    className="w-12 h-12 object-contain border border-gray-300 rounded-lg"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(request.vehicleType)}`}>
                                      {request.vehicleType}
                                    </span>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">{request.brandName}</div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    Models: {request.vehicleModels.join(', ')}
                                  </div>
                                  {request.notes && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      Notes: {request.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{request.userId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                User Request
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRequestStatusColor(request.status)}`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(request.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {request.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApproveNewBrandRequest(request)}
                                    disabled={actionLoading === request.id}
                                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  >
                                    {actionLoading === request.id ? 'Approving...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const notes = prompt('Enter rejection reason (optional):');
                                      if (notes !== null) {
                                        handleRejectNewBrandRequest(request, notes);
                                      }
                                    }}
                                    disabled={actionLoading === request.id}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  >
                                    {actionLoading === request.id ? 'Rejecting...' : 'Reject'}
                                  </button>
                                </div>
                              )}
                              {request.status === 'rejected' && (
                                <button
                                  onClick={() => handleApproveNewBrandRequest(request)}
                                  disabled={actionLoading === request.id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                >
                                  {actionLoading === request.id ? 'Approving...' : 'Approve'}
                                </button>
                              )}
                              {request.status === 'approved' && (
                                <button
                                  onClick={() => {
                                    const notes = prompt('Enter rejection reason (optional):');
                                    if (notes !== null) {
                                      handleRejectNewBrandRequest(request, notes);
                                    }
                                  }}
                                  disabled={actionLoading === request.id}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  {actionLoading === request.id ? 'Rejecting...' : 'Reject'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredRequests.length > itemsPerPage && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(Math.ceil(filteredRequests.length / itemsPerPage), currentPage + 1))}
                      disabled={currentPage >= Math.ceil(filteredRequests.length / itemsPerPage)}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filteredRequests.length)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{filteredRequests.length}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(Math.ceil(filteredRequests.length / itemsPerPage), currentPage + 1))}
                          disabled={currentPage >= Math.ceil(filteredRequests.length / itemsPerPage)}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'model-requests' ? (
            /* Model Requests Tab Content */
            <>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Search by brand, model, user, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Model Requests Table */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Model Requests</h3>
                </div>
                {modelRequestsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredModelRequests.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No model requests found</h3>
                      <p className="text-gray-500">
                        There are no model requests at the moment.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Model Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredModelRequests
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(request.vehicleType)}`}>
                                    {formatVehicleType(request.vehicleType)}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {`${request.brandName} - ${request.modelName}`}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {request.brandID ? `Brand ID: ${request.brandID}` : 'Brand ID: Not specified'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">User ID: {request.userId}</div>
                                <div className="text-sm text-gray-500">{request.user_name || 'Unknown User'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRequestStatusColor(request.status)}`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(request.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {request.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApproveModelRequest(request)}
                                    disabled={actionLoading === request.id}
                                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  >
                                    {actionLoading === request.id ? 'Approving...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const notes = prompt('Enter rejection reason (optional):');
                                      if (notes !== null) {
                                        handleRejectModelRequest(request, notes);
                                      }
                                    }}
                                    disabled={actionLoading === request.id}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  >
                                    {actionLoading === request.id ? 'Rejecting...' : 'Reject'}
                                  </button>
                                </div>
                              )}
                              {request.status === 'rejected' && (
                                <button
                                  onClick={() => handleApproveModelRequest(request)}
                                  disabled={actionLoading === request.id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                >
                                  {actionLoading === request.id ? 'Approving...' : 'Approve'}
                                </button>
                              )}
                              {request.status === 'approved' && (
                                <button
                                  onClick={() => {
                                    const notes = prompt('Enter rejection reason (optional):');
                                    if (notes !== null) {
                                      handleRejectModelRequest(request, notes);
                                    }
                                  }}
                                  disabled={actionLoading === request.id}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  {actionLoading === request.id ? 'Rejecting...' : 'Reject'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Notification */}
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            isVisible={notification.isVisible}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Add Vehicle Brand Modal */}
        <AddVehicleBrandModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleAddSuccess}
        />

        {/* Brand Request Modal */}
        <BrandRequestModal
          isOpen={isNewBrandRequestModalOpen}
          onClose={() => setIsNewBrandRequestModalOpen(false)}
          onSuccess={loadNewBrandRequests}
        />

      </DashboardLayout>
    </ProtectedRoute>
  );
} 