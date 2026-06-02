import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Camera, X, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { CONSUMER_REVIEW_TAGS, checkAndCreateTicket } from '@/lib/qualityEngine';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const EMOJI_MAP = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };
const LABEL_MAP = { 1: 'Very Poor', 2: 'Poor', 3: 'Okay', 4: 'Good', 5: 'Excellent' };

function StarPicker({ value, onChange, size = 'lg' }) {
  const [hover, setHover] = useState(0);
  const sz = size === 'lg' ? 'h-10 w-10' : 'h-7 w-7';
  return (
    <div className="flex gap-2 justify-center">
      {[1,2,3,4,5].map(i => (
        <button key={i} onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}>
          <Star className={`${sz} transition-all ${i <= (hover || value) ? 'fill-amber-400 text-amber-400 scale-110' : 'text-ink-tertiary'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewFlow() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1); // 1=overall, 2=sub-ratings, 3=tags, 4=comment, 5=done

  const [overallRating, setOverallRating] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [quality, setQuality] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Booking.get(bookingId),
      base44.auth.me(),
    ]).then(([b, u]) => { setBooking(b); setUser(u); });
  }, [bookingId]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handlePhotoUpload = async (e) => {
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotos(p => [...p, file_url]);
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!overallRating) return toast.error('Please select a rating');
    setSubmitting(true);
    const reviewPayload = {
      booking_id: bookingId,
      partner_email: booking.partner_email,
      consumer_email: user.email,
      consumer_name: isAnon ? 'Anonymous' : user.full_name,
      service_type: booking.service_type,
      rating: overallRating,
      punctuality_rating: punctuality || null,
      quality_rating: quality || null,
      professionalism_rating: professionalism || null,
      tags: selectedTags,
      comment,
      photos,
      is_anonymous: isAnon,
      is_visible: true,
      is_repeat_customer: false,
      moderation_status: overallRating >= 3 ? 'approved' : 'pending',
      helpful_count: 0,
    };
    const review = await base44.entities.Review.create(reviewPayload);
    await base44.entities.Booking.update(bookingId, {
      rating: overallRating, review: comment,
    });
    // Auto quality ticket for low ratings
    if (overallRating < 3) {
      const tickets = await base44.entities.QualityTicket.filter({ partner_email: booking.partner_email });
      await checkAndCreateTicket(
        { ...reviewPayload, partner_name: booking.partner_name, id: review.id },
        tickets
      );
    }
    setSubmitting(false);
    setStep(5);
  };

  if (!booking) return (
    <div className="flex justify-center pt-32">
      <div className="w-6 h-6 border-2 border-raised border-t-brand rounded-full animate-spin" />
    </div>
  );

  if (booking.rating) return (
    <div className="min-h-screen bg-bg font-inter flex flex-col items-center justify-center px-5">
      <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">Already Reviewed</h2>
      <p className="text-ink-secondary text-sm text-center mb-6">You've already submitted a review for this booking.</p>
      <Button onClick={() => navigate(`/booking/${bookingId}`)} className="rounded-xl px-8">Back to Booking</Button>
    </div>
  );

  if (step === 5) return (
    <div className="min-h-screen bg-bg font-inter flex flex-col items-center justify-center px-5 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-xl font-bold mb-2">Thank you!</h2>
      <p className="text-ink-secondary text-sm mb-2">Your review helps improve our service quality.</p>
      <div className="text-5xl my-4">{EMOJI_MAP[overallRating]}</div>
      <p className="font-bold text-lg">{LABEL_MAP[overallRating]}</p>
      <div className="flex gap-1 justify-center my-3">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`h-6 w-6 ${i <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-ink-tertiary'}`} />
        ))}
      </div>
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center mb-4">
          {selectedTags.map(t => (
            <span key={t} className="text-xs bg-brand-tint text-brand-ink px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2 w-full max-w-xs mt-4">
        <Button onClick={() => navigate(`/booking/${bookingId}`)} className="rounded-xl">View Booking</Button>
        <Button onClick={() => navigate('/')} variant="outline" className="rounded-xl">Back to Home</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg font-inter pb-32">
      {/* Header */}
      <div className="bg-surface border-b border-hairline/10 px-5 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
            className="w-9 h-9 rounded-xl bg-raised flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-ink" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-base text-ink">Rate Your Experience</h1>
            <p className="text-xs text-ink-secondary">{booking.service_type} • {booking.partner_name}</p>
          </div>
          <span className="text-xs text-ink-secondary">{step}/4</span>
        </div>
        {/* Progress */}
        <div className="flex gap-1 mt-3">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-brand' : 'bg-raised'}`} />
          ))}
        </div>
      </div>

      <div className="px-5 pt-8 max-w-lg mx-auto text-ink">

        {/* Step 1: Overall Rating */}
        {step === 1 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-brand/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-brand">{booking.partner_name?.charAt(0)}</span>
            </div>
            <h2 className="text-xl font-bold mb-1">How was {booking.partner_name?.split(' ')[0]}?</h2>
            <p className="text-sm text-ink-secondary mb-8">{booking.service_type} on {new Date(booking.date).toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

            <StarPicker value={overallRating} onChange={setOverallRating} size="lg" />

            {overallRating > 0 && (
              <div className="mt-4 animate-in fade-in duration-300">
                <span className="text-4xl">{EMOJI_MAP[overallRating]}</span>
                <p className="text-sm font-semibold mt-2">{LABEL_MAP[overallRating]}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Sub-Ratings */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-1 text-center">Rate the details</h2>
            <p className="text-sm text-ink-secondary text-center mb-6">Optional — but very helpful!</p>
            {[
              { label: 'Punctuality', value: punctuality, onChange: setPunctuality },
              { label: 'Work Quality', value: quality, onChange: setQuality },
              { label: 'Professionalism', value: professionalism, onChange: setProfessionalism },
            ].map(({ label, value, onChange }) => (
              <div key={label} className="mb-6">
                <p className="text-sm font-semibold mb-3 text-center">{label}</p>
                <StarPicker value={value} onChange={onChange} size="md" />
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Tags + Photos */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-1 text-center">What stood out?</h2>
            <p className="text-sm text-ink-secondary text-center mb-6">Select all that apply</p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {CONSUMER_REVIEW_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-brand text-ink-inverse border-brand scale-105'
                      : 'bg-surface border-hairline/10 text-ink hover:border-brand/50'
                  }`}>
                  {tag}
                </button>
              ))}
            </div>

            {/* Photos */}
            <div className="bg-raised/50 rounded-2xl p-4">
              <p className="text-sm font-semibold mb-2">Add photos (optional)</p>
              <p className="text-xs text-ink-secondary mb-3">Show before/after work or issues</p>
              <div className="flex gap-2 flex-wrap">
                {photos.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="h-2.5 w-2.5 text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-hairline/10 bg-surface flex flex-col items-center justify-center cursor-pointer">
                  {uploading ? <div className="w-4 h-4 border-2 border-raised border-t-brand rounded-full animate-spin" />
                    : <Camera className="h-5 w-5 text-ink-secondary" />}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Comment + Options */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-1 text-center">Anything to add?</h2>
            <p className="text-sm text-ink-secondary text-center mb-6">Your written review helps others decide</p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              placeholder={overallRating >= 4
                ? "What did you love about the service? Any specific details..."
                : "What could have been better? Help us understand..."}
              className="w-full bg-raised text-ink rounded-2xl px-4 py-3 text-sm outline-none resize-none mb-4 placeholder:text-ink-tertiary"
            />
            <button onClick={() => setIsAnon(!isAnon)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all mb-4 ${isAnon ? 'border-brand bg-brand/5' : 'border-hairline/10 bg-surface'}`}>
              <div>
                <p className="text-sm font-semibold text-left">Post anonymously</p>
                <p className="text-xs text-ink-secondary">Your name won't be shown publicly</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isAnon ? 'border-brand bg-brand' : 'border-hairline/10 bg-surface'}`}>
                {isAnon && <div className="w-2 h-2 bg-surface rounded-full" />}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-hairline/10 px-5 py-4">
        <div className="max-w-lg mx-auto">
          {step < 4 ? (
            <Button
              onClick={() => { if (step === 1 && !overallRating) { toast.error('Please select a rating'); return; } setStep(s => s + 1); }}
              className="w-full h-12 rounded-2xl text-base font-bold shadow-e2 bg-brand text-ink-inverse hover:bg-brand/90">
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => navigate(`/booking/${bookingId}`)} variant="outline" className="flex-1 h-12 rounded-2xl border-hairline/10 text-ink">
                Skip
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 h-12 rounded-2xl text-base font-bold bg-brand text-ink-inverse shadow-e2 hover:bg-brand/90">
                {submitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Submit Review'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}