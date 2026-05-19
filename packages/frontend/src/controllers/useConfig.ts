import { useState, useEffect, useCallback } from 'react';
import { configService, type SystemConfig } from '../models/config.service';

export function useConfig() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await configService.getAll();
      setConfigs(data);
    } catch {}
    finally {
      setLoading(false);
    }
  }, []);

  const saveConfigs = async (updates: { key: string; value: string }[]) => {
    setSaving(true);
    try {
      const data = await configService.update(updates);
      setConfigs(data);
    } finally {
      setSaving(false);
    }
  };

  const getValue = (key: string) => configs.find((c) => c.key === key)?.value || '';

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return { configs, loading, saving, fetchConfigs, saveConfigs, getValue };
}
