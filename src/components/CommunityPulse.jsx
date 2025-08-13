// components/CommunityPulse.jsx
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function CommunityPulse() {
  const [count, setCount] = useState(0);
  const pollRef = useRef(null);

  async function fetchLiveCount() {
    // Anyone "seen" in the last 45s is considered live
    const threshold = new Date(Date.now() - 45 * 1000).toISOString();

    const { count, error } = await supabase
      .from('presence')
      .select('user_key', { count: 'exact', head: true })
      .gt('last_seen', threshold);

    if (!error) setCount(count || 0);
  }

  useEffect(() => {
    fetchLiveCount();                    // initial
    pollRef.current = setInterval(fetchLiveCount, 15000); // poll every 15s
    return () => clearInterval(pollRef.current);
  }, []);

  return (
    <div className="pulse">
      <span className="pulse-dot" aria-hidden="true"></span>
      <span>
        <strong className="pulse-count">{count.toLocaleString()}</strong> people are breathing with you now
      </span>
    </div>
  );
}
