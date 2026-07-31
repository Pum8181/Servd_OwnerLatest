import { useEffect, useMemo, useRef, useState } from "react";
import { subscribeTableRequests, getRequestStatus, requestServer } from "../lib/serverRequests";
import { friendlyFirebaseError } from "../lib/errors";

// Owns the whole "request a server" flow for one table: the live
// Firestore subscription, the cooldown/bump logic, and the modal's
// view state — kept out of CustomerApp so that file's diff stays small
// and this feature can't accidentally touch unrelated order/menu state.
export function useServerRequest(table) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState("choice"); // choice | cooldown | confirmed | resolved
  const [submitting, setSubmitting] = useState(false);

  useEffect(
    () => subscribeTableRequests(table, setRequests, (err) => setError(friendlyFirebaseError(err, "check server requests"))),
    [table]
  );

  const latest = requests[0] || null;
  const pending = !!latest && latest.status !== "resolved";

  // Auto-acknowledge: if the modal is open showing "confirmed" (waiting)
  // and the owner resolves it live, flip to a brief "resolved" state
  // instead of leaving the guest staring at a now-stale "someone's on
  // their way" message.
  const wasPendingRef = useRef(pending);
  useEffect(() => {
    if (wasPendingRef.current && !pending && modalOpen && view === "confirmed") {
      setView("resolved");
      const t = setTimeout(() => setModalOpen(false), 2200);
      return () => clearTimeout(t);
    }
    wasPendingRef.current = pending;
  }, [pending, modalOpen, view]);

  function openModal() {
    const status = getRequestStatus(requests);
    setView(status.canRequest ? "choice" : "cooldown");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function chooseServer() {
    setSubmitting(true);
    try {
      await requestServer(table, requests);
      setView("confirmed");
    } catch (err) {
      console.error(err);
      setError(friendlyFirebaseError(err, "request a server"));
    } finally {
      setSubmitting(false);
    }
  }

  function chooseOnline() {
    setModalOpen(false);
  }

  const remainingLabel = useMemo(() => {
    const status = getRequestStatus(requests);
    if (status.mode !== "cooldown") return "";
    const mins = Math.ceil(status.remainingMs / 60000);
    return `${mins} minute${mins === 1 ? "" : "s"}`;
  }, [requests]);

  return {
    pending,
    error,
    modalOpen,
    view,
    submitting,
    remainingLabel,
    openModal,
    closeModal,
    chooseServer,
    chooseOnline,
  };
}
