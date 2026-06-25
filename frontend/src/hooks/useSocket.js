import { useEffect, useState } from 'react'
import { onMatchUpdate } from '../services/socket'

export const useMatchUpdates = (callback) => {
  useEffect(() => {
    const handleUpdate = (data) => {
      callback(data)
    }
    
    onMatchUpdate(handleUpdate)
  }, [callback])
}

export const useStandingsUpdates = (callback) => {
  useEffect(() => {
    const handleUpdate = (data) => {
      callback(data)
    }
    
    // For now, using the match update to trigger standings updates
    onMatchUpdate(handleUpdate)
  }, [callback])
}

export const useKnockoutUpdates = (callback) => {
  useEffect(() => {
    const handleUpdate = (data) => {
      callback(data)
    }
    
    onMatchUpdate(handleUpdate)
  }, [callback])
}
