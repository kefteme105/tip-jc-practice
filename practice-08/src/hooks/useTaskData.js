import { useState, useEffect, useRef } from 'react';
export function useTaskData({ api, filters }) {
  const [snapshot, setSnapshot] = useState({ tasks: [], categories: [], meta: { total: 0 } });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);
  const mounted = useRef(false);
  const mutation = useRef(null);
  const { q, completed, priority, categoryId } = filters;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; mutation.current?.abort(); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setStatus('loading'); setError(null);
    async function load() {
      try {
        const next = await api.loadInitialData({ q, completed, priority, categoryId }, { signal: controller.signal });
        if (!active) return;
        setSnapshot(next); setStatus('ready');
      } catch (cause) {
        if (!active || controller.signal.aborted) return;
        setError(cause); setStatus('error');
      }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, [api, q, completed, priority, categoryId, revision]);
  function refresh() { setRevision(value => value + 1); }
  async function mutate(operation) {
    if (!mounted.current || mutation.current) return false;
    const controller = new AbortController();
    mutation.current = controller;
    setPending(true); setMutationError(null);
    try {
      await operation(controller.signal);
      if (!mounted.current || controller.signal.aborted) return false;
      refresh();
      return true;
    } catch (cause) {
      if (mounted.current && !controller.signal.aborted) setMutationError(cause);
      return false;
    } finally {
      if (mutation.current === controller) {
        mutation.current = null;
        if (mounted.current) setPending(false);
      }
    }
  }
  return {
    snapshot, status, error, mutationError, pending, refresh,
    saveTask: (id, value) => mutate(signal => id === null ? api.createTask(value, { signal }) : api.updateTask(id, value, { signal })),
    toggleTask: task => mutate(signal => api.setTaskCompleted(task.id, !task.completed, { signal })),
    deleteTask: id => mutate(signal => api.deleteTask(id, { signal })),
    resetData: () => mutate(signal => api.resetDemoData({ signal })),
  };
}
