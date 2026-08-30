import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AppPage from './dashboard/AppPage';
import { Button, Field, Panel } from './dashboard/ui';
import { inputClass, textareaClass } from './dashboard/tokens';

const FOOD_TITLE_RE = /[a-zA-Z]/g;
const QUANTITY_NUM_RE = /\d+(\.\d+)?/;
const QUANTITY_VALID_CHARS_RE = /^[a-zA-Z0-9 .,/+\-()]+$/;

const MIN_PICKUP_MINUTES = 30;
const MAX_PICKUP_DAYS = 7;
const MS_PER_MIN = 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const validators = {
  foodItem: (v) => {
    const s = v.trim();
    if (s.length < 3) return 'Title must be at least 3 characters';
    if (s.length > 80) return 'Title must be under 80 characters';
    if ((s.match(FOOD_TITLE_RE) || []).length < 2)
      return 'Title must contain real words (not just numbers/symbols)';
    return '';
  },
  quantity: (v) => {
    const s = v.trim();
    if (!s) return 'Quantity is required';
    if (s.length > 30) return 'Quantity must be under 30 characters';
    if (!QUANTITY_VALID_CHARS_RE.test(s))
      return 'Use letters, numbers, and basic punctuation only';
    const match = s.match(QUANTITY_NUM_RE);
    if (!match) return "Must include a number, e.g. '12 servings' or '5 kg'";
    if (parseFloat(match[0]) <= 0) return 'Quantity must be greater than zero';
    return '';
  },
  pickupAddress: (v) => {
    const s = v.trim();
    if (s.length < 5) return 'Address must be at least 5 characters';
    if (s.length > 150) return 'Address must be under 150 characters';
    if ((s.match(FOOD_TITLE_RE) || []).length < 3)
      return 'Address must contain a street/area name';
    return '';
  },
  expiryTime: (v) => {
    if (!v) return 'Pickup time is required';
    const target = new Date(v).getTime();
    if (Number.isNaN(target)) return 'Invalid date';
    const diffMs = target - Date.now();
    if (diffMs < MIN_PICKUP_MINUTES * MS_PER_MIN) {
      return `Pickup must be at least ${MIN_PICKUP_MINUTES} minutes from now`;
    }
    if (diffMs > MAX_PICKUP_DAYS * MS_PER_DAY) {
      return `Pickup must be within ${MAX_PICKUP_DAYS} days`;
    }
    return '';
  },
  description: (v) => {
    if (v.length > 500) return 'Description must be under 500 characters';
    return '';
  },
};

function Hint({ error, children }) {
  if (error) {
    return (
      <p className="mt-1.5 text-[11.5px] font-semibold text-red-600 dark:text-red-300">{error}</p>
    );
  }
  return children ? (
    <p className="mt-1.5 text-[11.5px] text-ink-faint dark:text-white/30">{children}</p>
  ) : null;
}

export default function CreateDonation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    foodItem: '',
    foodType: 'cooked',
    quantity: '',
    expiryTime: '',
    description: '',
    pickupAddress: '',
  });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    const out = {};
    for (const [field, fn] of Object.entries(validators)) {
      out[field] = fn(formData[field] || '');
    }
    return out;
  }, [formData]);

  const hasErrors = Object.values(errors).some(Boolean);
  const showError = (field) => (touched[field] && errors[field]) || '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      foodItem: true,
      quantity: true,
      pickupAddress: true,
      expiryTime: true,
      description: true,
    });
    if (hasErrors) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setLoading(true);
    try {
      const hoursLeft = Math.ceil((new Date(formData.expiryTime) - Date.now()) / 3600000);
      await api.post('/donations', {
        food_type: `[${formData.foodType}] ${formData.foodItem.trim()}`,
        quantity: formData.quantity.trim(),
        address: formData.pickupAddress.trim(),
        best_before: hoursLeft,
        notes: formData.description.trim() || null,
      });
      toast.success('Donation listed successfully!');
      navigate('/donor-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to list donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field) =>
    `${inputClass} ${showError(field) ? 'border-red-400 dark:border-red-500/50' : ''}`;

  return (
    <AppPage
      back="/donor-dashboard"
      backLabel="Back to dashboard"
      title="List surplus food"
      subtitle="About a minute. Nearby NGOs are notified the moment you publish."
      width="max-w-2xl"
    >
      <Panel className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Field label="What is it?">
            <input
              type="text"
              id="foodItem"
              name="foodItem"
              value={formData.foodItem}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 50 trays of mixed veg curry"
              maxLength={80}
              className={fieldClass('foodItem')}
            />
            <Hint error={showError('foodItem')} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category">
              <select
                id="foodType"
                name="foodType"
                value={formData.foodType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="cooked">Cooked meal</option>
                <option value="raw">Raw ingredients</option>
                <option value="bakery">Bakery items</option>
                <option value="packaged">Packaged food</option>
              </select>
            </Field>

            <Field label="Quantity">
              <input
                type="text"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 15 kg or 50 servings"
                maxLength={30}
                className={fieldClass('quantity')}
              />
              <Hint error={showError('quantity')}>Must include a number.</Hint>
            </Field>
          </div>

          <Field label="Pickup address">
            <input
              type="text"
              id="pickupAddress"
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. 12 MG Road, New Delhi"
              maxLength={150}
              className={fieldClass('pickupAddress')}
            />
            <Hint error={showError('pickupAddress')}>
              Shared only with the NGO that claims this listing.
            </Hint>
          </Field>

          <Field label="Must be collected by">
            <input
              type="datetime-local"
              id="expiryTime"
              name="expiryTime"
              value={formData.expiryTime}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldClass('expiryTime')}
            />
            <Hint error={showError('expiryTime')}>
              NGOs usually need at least two hours to arrange a pickup.
            </Hint>
          </Field>

          <Field label={`Notes (${formData.description.length}/500)`}>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="3"
              maxLength={500}
              placeholder="Any allergens? Special pickup instructions?"
              className={`${textareaClass} ${showError('description') ? 'border-red-400 dark:border-red-500/50' : ''}`}
            />
            <Hint error={showError('description')} />
          </Field>

          <div className="pt-2 border-t border-brand-line dark:border-night-line">
            <Button
              type="submit"
              size="lg"
              disabled={loading || hasErrors}
              className="w-full mt-6"
            >
              {loading ? 'Listing…' : 'Publish listing'}
            </Button>
            {hasErrors && Object.values(touched).some(Boolean) && (
              <p className="mt-2 text-center text-[11.5px] font-semibold text-red-600 dark:text-red-300">
                Fix the highlighted fields to continue.
              </p>
            )}
          </div>
        </form>
      </Panel>
    </AppPage>
  );
}
