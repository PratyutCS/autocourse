import React, { useState, useEffect } from 'react';
import Input from './ui/Input';
import { useDebounce } from './hooks/use-debounce';
import axios from 'axios';
import { cn } from "@/lib/utils";

const TargetAttainmentTable = ({ initialData, onSave }) => {
    console.log(initialData);
    const [targets, setTargets] = useState(() => {
      // Check if initialData exists and has valid structure
      if (initialData && Array.isArray(initialData) && initialData.length >= 3) {
        return initialData.map(target => ({
          ...target,
          percentage: target.percentage || '',
          description: target.description || 'Students scoring more than the Target Percentage'
        }));
      }
  
      // Default data if no initialData is provided
      return [
        { id: 3, percentage: '', description: 'Students scoring more than the Target Percentage', number: 3 },
        { id: 2, percentage: '', description: 'Students scoring more than the Target Percentage', number: 2 },
        { id: 1, percentage: '', description: 'Students scoring more than the Target Percentage', number: 1 }
      ];
    });
  
    const [errors, setErrors] = useState([]);
    const debouncedTargets = useDebounce(targets, 1000);
  
    const validatePercentages = (values) => {
      return values.every(target => {
        const percentage = parseInt(target.percentage);
        return !isNaN(percentage) && percentage >= 0 && percentage <= 100;
      });
    };
  
    const handlePercentageChange = (id, value) => {
      const newTargets = targets.map(target => 
        target.id === id ? { ...target, percentage: value } : target
      );
      setTargets(newTargets);
      
      const validation = newTargets.map((t) => ({
        id: t.id,
        valid: !isNaN(parseInt(t.percentage)) && parseInt(t.percentage) >= 0 && parseInt(t.percentage) <= 100
      }));
      setErrors(validation.filter(t => !t.valid).map(t => t.id));
    };
  
    useEffect(() => {
      if (validatePercentages(debouncedTargets)) {
        onSave?.(debouncedTargets);
      }
    }, [debouncedTargets, onSave]);
  
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-600">Percentage</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600">Description</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600">Level</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => (
              <tr 
                key={target.id}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  errors.includes(target.id) ? 'bg-red-50' : ''
                )}
              >
                <td className="p-3">
                  <div className="relative w-24">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={target.percentage}
                      onChange={(e) => handlePercentageChange(target.id, e.target.value)}
                      className={cn(
                        'pr-8',
                        errors.includes(target.id) ? 'border-red-500' : ''
                      )}
                    />
                    <span className="absolute right-2 top-2.5 text-gray-400">%</span>
                  </div>
                </td>
                <td className="p-3 text-gray-600">{target.description}</td>
                <td className="p-3 text-gray-600 font-medium">Level {target.number}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {errors.length > 0 && (
          <div className="p-3 bg-red-50 border-t border-red-100 text-sm text-red-600">
            Please enter valid percentages (0-100) for all targets
          </div>
        )}
      </div>
    );
  };
  
export default TargetAttainmentTable;