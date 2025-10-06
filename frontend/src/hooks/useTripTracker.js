import { useEffect, useRef, useState, useCallback } from 'react';
import axios from '../lib/axios';

export default function useTripTracker(idToken) {
  const watchIdRef = useRef(null);
  const bufferRef = useRef([]);
  const intervalRef = useRef(null);
  const [tripId, setTripId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  async function startTrip(vehicleId, name) {
    try {
      const response = await axios.post(
        '/api/trip/start',
        { vehicleId, name },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      
      const newTripId = response.data.tripId;
      setTripId(newTripId);
      setIsTracking(true);

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          bufferRef.current.push({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            ts: new Date().toISOString(),
            speed: position.coords.speed || 0
          });

          // Send batch when buffer reaches 10 points
          if (bufferRef.current.length >= 10) {
            sendTelemetry(newTripId);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 3000,
          timeout: 5000
        }
      );

      // Also send telemetry every 10 seconds
      intervalRef.current = setInterval(() => {
        if (bufferRef.current.length > 0) {
          sendTelemetry(newTripId);
        }
      }, 10000);

      return newTripId;
    } catch (error) {
      console.error('Error starting trip:', error);
      throw error;
    }
  }

  async function sendTelemetry(tripIdToUse) {
    if (bufferRef.current.length === 0) return;

    const points = bufferRef.current.splice(0);
    try {
      await axios.post(
        '/api/trip/telemetry',
        { tripId: tripIdToUse, points },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
    } catch (error) {
      console.error('Error sending telemetry:', error);
      // Put points back if failed
      bufferRef.current.unshift(...points);
    }
  }

  async function endTrip(vehicleId) {
    try {
      // Clear tracking
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Send remaining points
      if (bufferRef.current.length > 0) {
        await sendTelemetry(tripId);
      }

      // End trip
      const response = await axios.post(
        '/api/trip/end',
        { tripId, vehicleId },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      setTripId(null);
      setIsTracking(false);
      bufferRef.current = [];

      return response.data.trip;
    } catch (error) {
      console.error('Error ending trip:', error);
      throw error;
    }
  }

  return { startTrip, endTrip, tripId, isTracking };
}
