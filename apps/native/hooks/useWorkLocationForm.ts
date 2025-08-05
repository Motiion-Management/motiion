import { useState, useCallback, useEffect } from 'react';

import { type PlaceKitLocation } from '~/components/ui/location-picker-placekit';

export interface WorkLocationFormData {
  locations: (PlaceKitLocation | null)[];
}

export interface WorkLocationFormOptions {
  primaryLocation?: PlaceKitLocation | null;
  existingWorkLocations?: PlaceKitLocation[];
  onSubmit?: (data: WorkLocationFormData) => Promise | void;
}

export interface WorkLocationFormState {
  data: WorkLocationFormData;
  errors: {
    locations?: string[];
  };
  isSubmitting: boolean;
  isValid: boolean;
}

export interface WorkLocationFormActions {
  setLocation: (index: number, location: PlaceKitLocation | null) => void;
  addLocation: () => void;
  removeLocation: (index: number) => void;
  submit: () => Promise;
  reset: () => void;
  validate: () => boolean;
}

const MAX_LOCATIONS = 5;

export function useWorkLocationForm(options: WorkLocationFormOptions = {}) {
  const { primaryLocation = null, existingWorkLocations = [], onSubmit } = options;

  const [state, setState] = useState<WorkLocationFormState>(() => {
    // If we have existing work locations, use them; otherwise use primary location
    const initialLocations =
      existingWorkLocations.length > 0
        ? existingWorkLocations
        : primaryLocation
          ? [primaryLocation]
          : [null];

    return {
      data: {
        locations: initialLocations,
      },
      errors: {},
      isSubmitting: false,
      isValid: initialLocations[0] !== null,
    };
  });

  // Check for duplicate locations
  const hasDuplicates = useCallback((locations: (PlaceKitLocation | null)[]) => {
    const validLocations = locations.filter(Boolean) as PlaceKitLocation[];
    const locationStrings = validLocations.map((loc) => `${loc.city}, ${loc.state}`);
    return locationStrings.length !== new Set(locationStrings).size;
  }, []);

  // Get already selected locations to filter out from dropdowns
  const getSelectedLocations = useCallback(() => {
    return state.data.locations.filter(Boolean) as PlaceKitLocation[];
  }, [state.data.locations]);

  const validateForm = useCallback(() => {
    const { locations } = state.data;
    const errors: string[] = [];

    // Check if at least the first location is filled
    if (!locations[0]) {
      errors[0] = 'Primary location is required';
    }

    // Check for duplicates
    if (hasDuplicates(locations)) {
      const duplicateError = 'Location already added';
      locations.forEach((location, index) => {
        if (location) {
          const duplicateCount = locations.filter(
            (loc, i) =>
              loc &&
              i !== index &&
              `${loc.city}, ${loc.state}` === `${location.city}, ${location.state}`
          ).length;
          if (duplicateCount > 0) {
            errors[index] = duplicateError;
          }
        }
      });
    }

    const isValid = locations[0] !== null && !hasDuplicates(locations);

    setState((prev) => ({
      ...prev,
      errors: { locations: errors.length > 0 ? errors : undefined },
      isValid,
    }));

    return isValid;
  }, [state.data, hasDuplicates]);

  const setLocation = useCallback((index: number, location: PlaceKitLocation | null) => {
    setState((prev) => {
      const newLocations = [...prev.data.locations];
      newLocations[index] = location;
      return {
        ...prev,
        data: {
          ...prev.data,
          locations: newLocations,
        },
      };
    });
  }, []);

  const addLocation = useCallback(() => {
    setState((prev) => {
      if (prev.data.locations.length >= MAX_LOCATIONS) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          locations: [...prev.data.locations, null],
        },
      };
    });
  }, []);

  const removeLocation = useCallback((index: number) => {
    setState((prev) => {
      // Cannot remove the first location (primary)
      if (index === 0) return prev;

      const newLocations = prev.data.locations.filter((_, i) => i !== index);
      return {
        ...prev,
        data: {
          ...prev.data,
          locations: newLocations,
        },
      };
    });
  }, []);

  const submit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      if (onSubmit) {
        await onSubmit(state.data);
      }
    } catch (error) {
      console.error('Work location form submission error:', error);
      setState((prev) => ({
        ...prev,
        errors: {
          locations: ['Failed to save work locations. Please try again.'],
        },
        isValid: false,
      }));
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [state.data, onSubmit, validateForm]);

  const reset = useCallback(() => {
    const initialLocations =
      existingWorkLocations.length > 0
        ? existingWorkLocations
        : primaryLocation
          ? [primaryLocation]
          : [null];

    setState({
      data: {
        locations: initialLocations,
      },
      errors: {},
      isSubmitting: false,
      isValid: initialLocations[0] !== null,
    });
  }, [primaryLocation, existingWorkLocations]);

  // Validate whenever locations change
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const canAddMore = state.data.locations.length < MAX_LOCATIONS;
  const selectedLocations = getSelectedLocations();

  return {
    ...state,
    canAddMore,
    selectedLocations,
    maxLocations: MAX_LOCATIONS,
    actions: {
      setLocation,
      addLocation,
      removeLocation,
      submit,
      reset,
      validate: () => validateForm(),
    },
  };
}
