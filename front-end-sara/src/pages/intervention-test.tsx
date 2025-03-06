import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { createIntervention } from '@/services/interventionService';
import { Button, Card, Input, Select, Textarea, Alert } from '@/components/ui';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { InterventionPriority, InterventionType } from '@/types/intervention';
import { toast } from 'react-hot-toast';

const InterventionTestPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'fire' as InterventionType,
    priority: 'MEDIUM' as InterventionPriority,
    location: {
      type: 'Point',
      coordinates: [1.888334, 46.603354] as [number, number], // Default to center of France
      address: ''
    },
    region: 'default-region',
    station: 'default-station',
    commander: 'default-commander',
    startTime: new Date().toISOString(),
    createdBy: 'system',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (address: string, lat?: number, lng?: number) => {
    console.log('Selected address:', address, 'Coordinates:', lat, lng);
    
    // Use the provided coordinates or default to center of France
    const coordinates: [number, number] = (
      lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)
    ) ? [lng, lat] : [1.888334, 46.603354];
    
    setFormData(prev => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates,
        address
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.title.trim()) {
      newErrors.push('Title is required');
    }
    
    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    }
    
    if (!formData.location.address.trim()) {
      newErrors.push('Address is required');
    }
    
    // Validate coordinates
    const [lng, lat] = formData.location.coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
      newErrors.push('Valid coordinates are required');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setWarnings([]);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Submitting intervention with data:', formData);
      
      const result = await createIntervention(formData);
      
      // Handle any warnings from the backend
      if (result.warnings && result.warnings.length > 0) {
        setWarnings(result.warnings);
        console.warn('Intervention created with warnings:', result.warnings);
      }
      
      toast.success('Intervention created successfully!');
      
      // Redirect to the intervention detail page
      if (result.intervention._id) {
        router.push(`/interventions/${result.intervention._id}`);
      } else {
        // If no ID (mock data), just show success
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating intervention:', error);
      
      if (error instanceof Error) {
        setErrors([error.message]);
        toast.error(error.message);
      } else {
        setErrors(['An unknown error occurred']);
        toast.error('Failed to create intervention');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Test Intervention</h1>
        
        {/* Display validation errors */}
        {errors.length > 0 && (
          <Alert variant="error" className="mb-4">
            <h3 className="font-bold">Validation Errors:</h3>
            <ul className="list-disc pl-5">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
        
        {/* Display warnings */}
        {warnings.length > 0 && (
          <Alert variant="warning" className="mb-4">
            <h3 className="font-bold">Warnings:</h3>
            <ul className="list-disc pl-5">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block mb-1">Title</label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Intervention title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block mb-1">Description</label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the intervention"
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block mb-1">Type</label>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="fire">Fire</option>
                <option value="medical">Medical</option>
                <option value="rescue">Rescue</option>
                <option value="hazmat">Hazmat</option>
                <option value="other">Other</option>
              </Select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block mb-1">Priority</label>
              <Select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </div>
            
            <div>
              <label htmlFor="address" className="block mb-1">Location</label>
              <AddressAutocomplete
                onAddressSelect={handleAddressSelect}
                initialValue={formData.location.address}
              />
              <div className="text-sm text-gray-500 mt-1">
                Coordinates: [{formData.location.coordinates[0].toFixed(6)}, {formData.location.coordinates[1].toFixed(6)}]
              </div>
            </div>
            
            <div>
              <label htmlFor="region" className="block mb-1">Region</label>
              <Input
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                placeholder="Region"
              />
            </div>
            
            <div>
              <label htmlFor="station" className="block mb-1">Station</label>
              <Input
                id="station"
                name="station"
                value={formData.station}
                onChange={handleInputChange}
                placeholder="Station"
              />
            </div>
            
            <div>
              <label htmlFor="commander" className="block mb-1">Commander</label>
              <Input
                id="commander"
                name="commander"
                value={formData.commander}
                onChange={handleInputChange}
                placeholder="Commander"
              />
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Intervention'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default InterventionTestPage;
