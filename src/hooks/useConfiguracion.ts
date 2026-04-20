'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Configuracion } from '@/types/configuracion';

const CONFIG_ID = 'tienda-config';

export function useConfiguracion() {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const configDoc = await getDoc(doc(db, 'configuracion', CONFIG_ID));
        if (configDoc.exists()) {
          setConfig({ id: configDoc.id, ...configDoc.data() } as Configuracion);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const guardarConfig = async (data: Partial<Configuracion>, userId: string) => {
    try {
      await setDoc(doc(db, 'configuracion', CONFIG_ID), {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const updatedConfig = await getDoc(doc(db, 'configuracion', CONFIG_ID));
      if (updatedConfig.exists()) {
        setConfig({ id: updatedConfig.id, ...updatedConfig.data() } as Configuracion);
      }
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  };

  return { config, loading, guardarConfig };
}