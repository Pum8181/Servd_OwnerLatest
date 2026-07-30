import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { addMenuItem, updateMenuItem, CAROUSELS } from "../../lib/menu";
import { uploadMenuImage } from "../../lib/storage";
import { friendlyFirebaseError } from "../../lib/errors";

const CATEGORIES = ["Appetizers", "Mains", "Drinks", "Desserts"];

const BLANK = { name: "", desc: "", price: "", cat: CATEGORIES[0], image: "", tags: [] };

export default function MenuItemModal({ item, open, onClose }) {
  const [form, setForm] = useState(BLANK);
  const [previewUrl, setPreviewUrl] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const objectUrlRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(item ? { name: item.name, desc: item.desc, price: item.price, cat: item.cat || CATEGORIES[0], image: item.image || "", tags: item.tags || [] } : BLANK);
    setPreviewUrl(item?.image || "");
    setPendingFile(null);
    setError("");
  }, [open, item]);

  useEffect(() => () => {
    // Revoke the temporary blob URL on unmount/close so it doesn't leak memory.
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  if (!open) return null;

  const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Please choose a JPG or PNG.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`That image is ${(file.size / (1024 * 1024)).toFixed(1)}MB — please use one under 2MB.`);
      e.target.value = "";
      return;
    }
    setError("");
    // Instant local preview while the real upload happens in the
    // background on Save — this is the createObjectURL trick, purely
    // for immediate UI feedback, it is NOT what gets persisted.
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const blobUrl = URL.createObjectURL(file);
    objectUrlRef.current = blobUrl;
    setPreviewUrl(blobUrl);
    setPendingFile(file);
  }

  async function handleSave() {
    const price = parseFloat(form.price);
    if (!form.name.trim() || !form.cat || isNaN(price) || price < 0) {
      setError("Name, category, and a valid price are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let imageUrl = form.image;
      if (pendingFile) {
        // Real upload: Firebase Storage, not just the local preview —
        // this is what actually persists and shows on the customer app.
        const tempId = item?.id || `new-${Date.now()}`;
        imageUrl = await uploadMenuImage(pendingFile, tempId);
      }
      const fields = {
        name: form.name.trim(),
        desc: form.desc.trim(),
        price,
        cat: form.cat,
        image: imageUrl,
        tags: form.tags,
      };
      if (item) {
        await updateMenuItem(item.id, fields);
      } else {
        await addMenuItem({
          ...fields,
          order: 99,
          available: true,
          tag: null,
          discount: 0,
          spiceLevels: {},
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(friendlyFirebaseError(err, "save this item"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div className="c-overlay" style={{ zIndex: 120 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <div className="o-modal-shell">
      <motion.div
        className="o-edit-modal"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        role="dialog" aria-modal="true"
      >
        <h2 style={{ marginBottom: "1.1rem" }}>{item ? "Edit Item" : "Add New Item"}</h2>

        <div className="o-form-row">
          <label>Item Name
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>Category
            <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <label className="o-form-field">Description
          <textarea rows={2} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
        </label>

        <div className="o-form-row">
          <label>Price ($)
            <input type="number" min="0" step="0.25" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
          <label>Photo
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <span className="o-field-hint">Recommended: 800×600px (4:3 ratio), JPG/PNG, max size 2MB</span>
          </label>
        </div>

        <div className="o-form-field">
          Carousels (shown on the customer app's featured rows)
          <div className="o-tag-checkboxes">
            {CAROUSELS.map((label) => (
              <label key={label} className="o-tag-checkbox">
                <input
                  type="checkbox"
                  checked={form.tags.includes(label)}
                  onChange={(e) => {
                    const tags = e.target.checked
                      ? [...form.tags, label]
                      : form.tags.filter((t) => t !== label);
                    setForm({ ...form, tags });
                  }}
                />
                {label}
              </label>
            ))}
          </div>
          <span className="o-field-hint">"Today's Discounts" also includes any item with an active discount automatically.</span>
        </div>

        {previewUrl && (
          <div className="o-image-preview">
            <img src={previewUrl} alt="Preview" />
            {pendingFile && <span>Preview only — uploads to real storage when you save</span>}
          </div>
        )}

        {error && <p style={{ color: "var(--accent-deep)", fontSize: "0.875rem", marginTop: "0.5rem" }}>{error}</p>}

        <div className="o-edit-actions">
          <button type="button" className="o-btn-reject" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className="o-btn-approve" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Item"}
          </button>
        </div>
      </motion.div>
      </div>
    </AnimatePresence>
  );
}
