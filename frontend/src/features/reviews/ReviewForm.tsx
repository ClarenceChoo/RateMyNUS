import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { RatingStars } from "@/components/RatingStars";
import { createReview } from "@/features/reviews/reviewService";
import { useAuth } from "@/providers/AuthProvider";
import { getApplicableSubratings, type SubratingDefinition } from "@/config/subratings";
import { getTagsByType, type TagDefinition } from "@/config/tags";
import ModuleSelect from "@/features/modules/ModuleSelect";
import type { Entity, EntityType } from "@/types";

// ============================================================================
// Category-specific form configurations
// ============================================================================

type FormConfig = {
  title: string;
  icon: string;
  placeholder: string;
  minChars: number;
};

const FORM_CONFIG: Record<EntityType, FormConfig> = {
  DORM: {
    title: "Rate this Dorm",
    icon: "🏠",
    placeholder: "How's the living experience? Talk about room quality, facilities, social life, noise levels...",
    minChars: 20,
  },
  CLASSROOM: {
    title: "Rate this Classroom",
    icon: "🏫",
    placeholder: "How's learning here? Discuss seating comfort, visibility, audio quality, air conditioning...",
    minChars: 15,
  },
  PROFESSOR: {
    title: "Rate this Professor",
    icon: "👨‍🏫",
    placeholder: "Share your experience. How are their teaching style, clarity, helpfulness, grading fairness?",
    minChars: 30,
  },
  FOOD_PLACE: {
    title: "Rate this Food Place",
    icon: "🍜",
    placeholder: "How's the food? Talk about taste, portion size, value, queue time, cleanliness...",
    minChars: 15,
  },
  TOILET: {
    title: "Rate this Toilet",
    icon: "🚻",
    placeholder: "How's the experience? Discuss cleanliness, availability, supplies, smell...",
    minChars: 10,
  },
};

// ============================================================================
// Image Upload Component
// ============================================================================

function ImageUpload({
  images,
  onImagesChange,
  colorScheme,
}: {
  images: File[];
  onImagesChange: (files: File[]) => void;
  colorScheme: "amber" | "blue" | "orange" | "teal";
}) {
  const colorClasses = {
    amber: "border-amber-200 bg-amber-50",
    blue: "border-blue-200 bg-blue-50",
    orange: "border-orange-200 bg-orange-50",
    teal: "border-teal-200 bg-teal-50",
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    // Limit to 5 images max
    const newFiles = [...images, ...files].slice(0, 5);
    onImagesChange(newFiles);
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className={`space-y-2 rounded-lg border-2 border-dashed ${colorClasses[colorScheme]} p-4`}>
      <div className="text-sm font-semibold text-gray-700">📸 Add Photos (Optional)</div>
      <p className="text-xs text-gray-600">Upload up to 5 images to support your review</p>
      
      <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-current py-6 px-3 transition hover:bg-white/50">
        <div className="text-center">
          <div className="text-2xl mb-1">📷</div>
          <p className="text-xs font-medium text-gray-700">Click to upload images</p>
          <p className="text-xs text-gray-500">or drag and drop</p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={images.length >= 5}
          className="hidden"
        />
      </label>

      {images.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">{images.length}/5 images selected</div>
          <div className="flex flex-wrap gap-2">
            {images.map((file, idx) => (
              <div key={idx} className="relative group">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Tag Selector Component
// ============================================================================

function TagSelector({
  tags,
  selectedTags,
  onTagToggle,
}: {
  tags: TagDefinition[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-2 rounded-lg bg-linear-to-r from-gray-50 to-gray-100 p-3 border border-gray-200">
      <div className={`text-sm font-semibold text-gray-800 mb-2`}>Pick relevant tags (optional)</div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
              selectedTags.includes(tag.id)
                ? `${tag.color} ${tag.textColor} ring-2 ring-offset-1`
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <span>{tag.icon}</span>
            <span>{tag.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Subrating Input Component
// ============================================================================

function SubratingInput({
  subrating,
  value,
  onChange,
}: {
  subrating: SubratingDefinition;
  value: number;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{subrating.label}</div>
        {subrating.helperText && (
          <div className="text-xs text-zinc-400 truncate">{subrating.helperText}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <RatingStars value={value || null} onChange={onChange} clearable size="sm" />
        {value === 0 && <span className="text-xs text-zinc-400">Not rated</span>}
      </div>
    </div>
  );
}

// ============================================================================
// Individual Category Forms
// ============================================================================

type CategoryFormProps = {
  entity: Entity;
  config: FormConfig;
  subratings: SubratingDefinition[];
  subratingValues: Record<string, number>;
  onSubratingChange: (key: string, value: number | null) => void;
  rating: number;
  onRatingChange: (v: number) => void;
  text: string;
  onTextChange: (v: string) => void;
  anonymous: boolean;
  onAnonymousChange: (v: boolean) => void;
  tags: TagDefinition[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  images: File[];
  onImagesChange: (files: File[]) => void;
  colorScheme: "amber" | "blue" | "orange" | "teal";
  // Professor-specific
  moduleCode?: string;
  onModuleCodeChange?: (code: string) => void;
};

function DormForm(props: CategoryFormProps) {
  const { config, subratings, subratingValues, onSubratingChange, rating, onRatingChange, text, onTextChange, tags, selectedTags, onTagToggle, images, onImagesChange, colorScheme } = props;
  const [hallName, setHallName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [stayLength, setStayLength] = useState("");
  const [noiseLevel, setNoiseLevel] = useState("medium");
  const [distance, setDistance] = useState("medium");
  const [privacy, setPrivacy] = useState("medium");
  const [wifi, setWifi] = useState(false);
  const [laundry, setLaundry] = useState(false);
  const [studyRooms, setStudyRooms] = useState(false);
  const [pantry, setPantry] = useState(false);
  const [aircon, setAircon] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{config.icon} Overall Rating</span>
        <RatingStars value={rating} onChange={(v) => onRatingChange(v ?? 0)} />
      </div>

      {/* Dorm Context */}
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-amber-50 p-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-amber-800">Hall / RC / House</label>
          <input
            type="text"
            placeholder="e.g. Eusoff Hall, College House"
            value={hallName}
            onChange={(e) => setHallName(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-amber-800">Room Type</label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          >
            <option value="">Select...</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="ac">AC</option>
            <option value="non-ac">Non-AC</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-amber-800">Length of Stay (months)</label>
          <input
            type="number"
            placeholder="e.g. 12"
            value={stayLength}
            onChange={(e) => setStayLength(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
      </div>

      {/* Subratings */}
      <div className="rounded-lg bg-amber-50 p-4 space-y-1">
        <div className="text-sm font-semibold text-amber-800 mb-2">Rate Your Living Experience</div>
        {subratings.map((s) => (
          <SubratingInput
            key={s.key}
            subrating={s}
            value={subratingValues[s.key]}
            onChange={(v) => onSubratingChange(s.key, v)}
          />
        ))}
      </div>

      {/* Facilities Checklist */}
      <div className="space-y-2 rounded-lg bg-amber-50 p-3">
        <div className="text-sm font-semibold text-amber-800 mb-2">Available Facilities</div>
        <div className="space-y-1">
          {[
            { checked: wifi, setter: setWifi, label: "Reliable Wi-Fi" },
            { checked: laundry, setter: setLaundry, label: "Laundry availability" },
            { checked: studyRooms, setter: setStudyRooms, label: "Study rooms" },
            { checked: pantry, setter: setPantry, label: "Pantry quality" },
            { checked: aircon, setter: setAircon, label: "Aircon condition" },
          ].map((item) => (
            <label key={item.label} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.setter(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-amber-800">✓ {item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Scale Fields */}
      <div className="space-y-2 rounded-lg bg-amber-50 p-3">
        <div className="text-sm font-semibold text-amber-800 mb-2">Environment</div>
        <div className="space-y-2 text-sm">
          <div>
            <label className="text-xs text-amber-700 block mb-1">Noise Level</label>
            <div className="flex items-center gap-2">
              <span className="text-xs">Very quiet</span>
              <input
                type="range"
                min="1"
                max="5"
                value={noiseLevel === "quiet" ? 1 : noiseLevel === "medium" ? 3 : 5}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setNoiseLevel(v === 1 ? "quiet" : v === 3 ? "medium" : "noisy");
                }}
                className="flex-1"
              />
              <span className="text-xs">Very noisy</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-amber-700 block mb-1">Distance from Campus</label>
            <div className="flex items-center gap-2">
              <span className="text-xs">Near</span>
              <input
                type="range"
                min="1"
                max="5"
                value={distance === "near" ? 1 : distance === "medium" ? 3 : 5}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setDistance(v === 1 ? "near" : v === 3 ? "medium" : "far");
                }}
                className="flex-1"
              />
              <span className="text-xs">Very far</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-amber-700 block mb-1">Privacy Level</label>
            <div className="flex items-center gap-2">
              <span className="text-xs">Low</span>
              <input
                type="range"
                min="1"
                max="5"
                value={privacy === "low" ? 1 : privacy === "medium" ? 3 : 5}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setPrivacy(v === 1 ? "low" : v === 3 ? "medium" : "high");
                }}
                className="flex-1"
              />
              <span className="text-xs">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <TagSelector tags={tags} selectedTags={selectedTags} onTagToggle={onTagToggle} />

      {/* Image Upload */}
      <ImageUpload images={images} onImagesChange={onImagesChange} colorScheme={colorScheme} />

      {/* Text prompts */}
      <div className="space-y-2">
        <div>
          <label className="text-sm font-medium">👥 What kind of student would enjoy staying here?</label>
          <textarea
            placeholder="e.g. Outgoing, social students who love dorm activities"
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium">📊 Biggest pros and cons?</label>
          <textarea
            placeholder="e.g. Pro: Great community | Con: Can get noisy"
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium">🔄 Would you stay again?</label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200">
            <option value="">Select...</option>
            <option value="yes">Yes, definitely</option>
            <option value="maybe">Maybe</option>
            <option value="no">No, won't return</option>
          </select>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={config.placeholder}
        rows={4}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
      />
    </div>
  );
}

function ClassroomForm(props: CategoryFormProps) {
  const { config, subratings, subratingValues, onSubratingChange, rating, onRatingChange, text, onTextChange, tags, selectedTags, onTagToggle, images, onImagesChange, colorScheme } = props;
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [capacity, setCapacity] = useState("");
  const [seatType, setSeatType] = useState("");
  const [socketsAtSeat, setSocketsAtSeat] = useState("no");
  const [wifiReliability, setWifiReliability] = useState("medium");
  const [boardVisibility, setBoardVisibility] = useState("yes");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{config.icon} Overall Rating</span>
        <RatingStars value={rating} onChange={(v) => onRatingChange(v ?? 0)} />
      </div>

      {/* Classroom Context */}
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-blue-50 p-3">
        <div>
          <label className="text-xs font-medium text-blue-800">Building</label>
          <input
            type="text"
            placeholder="e.g. COM1, S17"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-blue-800">Room / LT Number</label>
          <input
            type="text"
            placeholder="e.g. #02-04, LT1"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-blue-800">Capacity</label>
          <input
            type="number"
            placeholder="e.g. 100"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-blue-800">Seat Type</label>
          <select
            value={seatType}
            onChange={(e) => setSeatType(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          >
            <option value="">Select...</option>
            <option value="foldable">Foldable</option>
            <option value="tablet-arm">Tablet Arm</option>
            <option value="desk">Desk</option>
            <option value="bench">Bench</option>
          </select>
        </div>
      </div>

      {/* Subratings */}
      <div className="rounded-lg bg-blue-50 p-4 space-y-1">
        <div className="text-sm font-semibold text-blue-800 mb-2">Rate Learning Environment</div>
        {subratings.map((s) => (
          <SubratingInput
            key={s.key}
            subrating={s}
            value={subratingValues[s.key]}
            onChange={(v) => onSubratingChange(s.key, v)}
          />
        ))}
      </div>

      {/* Facilities & Features */}
      <div className="space-y-2 rounded-lg bg-blue-50 p-3">
        <div className="text-sm font-semibold text-blue-800 mb-3">Facilities & Features</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-blue-700 min-w-0 flex-1">Power sockets at every seat?</span>
            <select
              value={socketsAtSeat}
              onChange={(e) => setSocketsAtSeat(e.target.value)}
              className="rounded px-2 py-1 text-xs border outline-none w-40 shrink-0"
            >
              <option value="no">No</option>
              <option value="partial">Partial</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-blue-700 min-w-0 flex-1">Wi-Fi reliability?</span>
            <select
              value={wifiReliability}
              onChange={(e) => setWifiReliability(e.target.value)}
              className="rounded px-2 py-1 text-xs border outline-none w-40 shrink-0"
            >
              <option value="poor">Poor</option>
              <option value="fair">Fair</option>
              <option value="medium">Medium</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-blue-700 min-w-0 flex-1">Board visibility from back row?</span>
            <select
              value={boardVisibility}
              onChange={(e) => setBoardVisibility(e.target.value)}
              className="rounded px-2 py-1 text-xs border outline-none w-40 shrink-0"
            >
              <option value="yes">Yes</option>
              <option value="barely">Barely</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tags */}
      <TagSelector tags={tags} selectedTags={selectedTags} onTagToggle={onTagToggle} />

      {/* Image Upload */}
      <ImageUpload images={images} onImagesChange={onImagesChange} colorScheme={colorScheme} />

      {/* Text prompts */}
      <div className="space-y-2">
        <div>
          <label className="text-sm font-medium">🪑 Best seats in this room?</label>
          <textarea
            placeholder="e.g. Front row center for clear view of board"
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium">⚠️ Any recurring issues?</label>
          <textarea
            placeholder="e.g. Lighting is poor in the back, air con breaks down often"
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium">⏱️ Suitable for long lectures?</label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">Select...</option>
            <option value="yes">Yes, very comfortable</option>
            <option value="somewhat">Somewhat</option>
            <option value="no">No, not suitable</option>
          </select>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={config.placeholder}
        rows={4}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

function ProfessorForm(props: CategoryFormProps) {
  const { config, subratings, subratingValues, onSubratingChange, rating, onRatingChange, text, onTextChange, moduleCode, onModuleCodeChange, tags, selectedTags, onTagToggle } = props;
  const [role, setRole] = useState("");
  const [classType, setClassType] = useState("");
  const [explainsClearly, setExplainsClearly] = useState(0);
  const [encouragesQuestions, setEncouragesQuestions] = useState(0);
  const [usefulFeedback, setUsefulFeedback] = useState(0);
  const [wellStructured, setWellStructured] = useState(0);
  const [caresStu, setCaresStu] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{config.icon} Overall Rating</span>
        <RatingStars value={rating} onChange={(v) => onRatingChange(v ?? 0)} />
      </div>

      {/* Professor Context */}
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-purple-50 p-3">
        <div>
          <label className="text-xs font-medium text-purple-800">📚 Module</label>
          <ModuleSelect
            value={moduleCode ?? ""}
            onChange={onModuleCodeChange ?? (() => {})}
            placeholder="Search module..."
            className="mt-1"
          />
          <p className="text-xs text-zinc-400 mt-1">Search by code (e.g. CS2030S)</p>
        </div>
        <div>
          <label className="text-xs font-medium text-purple-800">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          >
            <option value="">Select...</option>
            <option value="lecturer">Lecturer</option>
            <option value="tutor">Tutor</option>
            <option value="coordinator">Coordinator</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-purple-800">Class Type</label>
          <select
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          >
            <option value="">Select...</option>
            <option value="lecture">Lecture</option>
            <option value="tutorial">Tutorial</option>
            <option value="lab">Lab</option>
            <option value="seminar">Seminar</option>
          </select>
        </div>
      </div>

      {/* Subratings */}
      <div className="rounded-lg bg-purple-50 p-4 space-y-1">
        <div className="text-sm font-semibold text-purple-800 mb-2">Rate Teaching Quality</div>
        {subratings.map((s) => (
          <SubratingInput
            key={s.key}
            subrating={s}
            value={subratingValues[s.key]}
            onChange={(v) => onSubratingChange(s.key, v)}
          />
        ))}
      </div>

      {/* Likert Scale Agreement */}
      <div className="space-y-2 rounded-lg bg-purple-50 p-3">
        <div className="text-sm font-semibold text-purple-800 mb-3">Do you agree with these statements?</div>
        <div className="space-y-2 text-xs">
          {[
            { key: "clearly", label: "Explains concepts clearly", value: explainsClearly, onChange: setExplainsClearly },
            { key: "questions", label: "Encourages questions and discussion", value: encouragesQuestions, onChange: setEncouragesQuestions },
            { key: "feedback", label: "Provides useful feedback on assessments", value: usefulFeedback, onChange: setUsefulFeedback },
            { key: "structured", label: "Lectures are well-structured", value: wellStructured, onChange: setWellStructured },
            { key: "cares", label: "Cares about student learning", value: caresStu, onChange: setCaresStu },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3">
              <span className="text-purple-700 min-w-0 flex-1">{item.label}</span>
              <select
                value={item.value}
                onChange={(e) => item.onChange(parseInt(e.target.value))}
                className="rounded px-2 py-1 text-xs border outline-none w-40 shrink-0"
              >
                <option value={0}>Neutral</option>
                <option value={1}>Strongly Disagree</option>
                <option value={2}>Disagree</option>
                <option value={3}>Neutral</option>
                <option value={4}>Agree</option>
                <option value={5}>Strongly Agree</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Safety notice */}
      <div className="rounded-lg bg-red-50 p-3 border border-red-200">
        <div className="text-xs font-semibold text-red-800 mb-1">⚠️ Guidelines for Fair Feedback</div>
        <ul className="text-xs text-red-700 space-y-0.5">
          <li>✓ Focus on teaching methods and content delivery</li>
          <li>✓ Discuss course organization and structure</li>
          <li>✓ Share advice for future students</li>
          <li>✗ No personal attacks or speculation on intent</li>
          <li>✗ No assumptions about personality</li>
        </ul>
      </div>

      {/* Tags */}
      <TagSelector tags={tags} selectedTags={selectedTags} onTagToggle={onTagToggle} />

      {/* Teaching method feedback */}
      <div className="space-y-2">
        <div>
          <label className="text-sm font-medium">🎓 What teaching methods worked well?</label>
          <textarea
            placeholder="e.g. Interactive problem-solving sessions, real-world examples"
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium">🎯 What could be improved pedagogically?</label>
          <textarea
            placeholder="e.g. More time for practice problems, clearer lecture notes"
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium">💡 Advice for future students?</label>
          <textarea
            placeholder="e.g. Attend tutorials, start assignments early"
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={config.placeholder}
        rows={4}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-200"
      />
    </div>
  );
}

function FoodPlaceForm(props: CategoryFormProps) {
  const { config, subratings, subratingValues, onSubratingChange, rating, onRatingChange, text, onTextChange, tags, selectedTags, onTagToggle, images, onImagesChange, colorScheme } = props;
  const [canteen, setCanteen] = useState("");
  const [stallName, setStallName] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [priceRange, setPriceRange] = useState("$$");
  const [mealType, setMealType] = useState("");
  const [waitTime, setWaitTime] = useState("");
  const [spend, setSpend] = useState("");
  const [cashless, setCashless] = useState("yes");
  const [halal, setHalal] = useState("unknown");
  const [vegetarian, setVegetarian] = useState("no");
  const [recommendedDish, setRecommendedDish] = useState("");
  const [avoidDish, setAvoidDish] = useState("");
  const [wouldReturn, setWouldReturn] = useState("yes");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{config.icon} Overall Rating</span>
        <RatingStars value={rating} onChange={(v) => onRatingChange(v ?? 0)} />
      </div>

      {/* Food Context */}
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-orange-50 p-3">
        <div>
          <label className="text-xs font-medium text-orange-800">Canteen / Location</label>
          <input
            type="text"
            placeholder="e.g. Science Canteen"
            value={canteen}
            onChange={(e) => setCanteen(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-orange-800">Stall Name</label>
          <input
            type="text"
            placeholder="e.g. Uncle Bob's"
            value={stallName}
            onChange={(e) => setStallName(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-orange-800">Cuisine Type</label>
          <input
            type="text"
            placeholder="e.g. Chicken Rice, Nasi Kuning"
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-orange-800">Price Range</label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          >
            <option value="$">$ (Cheap)</option>
            <option value="$$">$$ (Mid-range)</option>
            <option value="$$$">$$$ (Expensive)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-orange-800">Meal Type</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          >
            <option value="">Select...</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="anytime">Anytime snack</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-orange-800">Typical Spend (SGD)</label>
          <input
            type="number"
            placeholder="e.g. 5.50"
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
      </div>

      {/* Subratings */}
      <div className="rounded-lg bg-orange-50 p-4 space-y-1">
        <div className="text-sm font-semibold text-orange-800 mb-2">Rate Your Meal</div>
        {subratings.map((s) => (
          <SubratingInput
            key={s.key}
            subrating={s}
            value={subratingValues[s.key]}
            onChange={(v) => onSubratingChange(s.key, v)}
          />
        ))}
      </div>

      {/* Additional info */}
      <div className="space-y-2 rounded-lg bg-orange-50 p-3">
        <div className="text-sm font-semibold text-orange-800 mb-2">Details</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-orange-700 min-w-0 flex-1">Average wait time (mins)</span>
            <input
              type="number"
              placeholder="e.g. 10"
              value={waitTime}
              onChange={(e) => setWaitTime(e.target.value)}
              className="w-40 rounded px-2 py-1 text-xs border outline-none shrink-0"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-orange-700 min-w-0 flex-1">Accepts cashless?</span>
            <select
              value={cashless}
              onChange={(e) => setCashless(e.target.value)}
              className="w-40 rounded px-2 py-1 text-xs border outline-none shrink-0"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-orange-700 min-w-0 flex-1">Halal-certified?</span>
            <select
              value={halal}
              onChange={(e) => setHalal(e.target.value)}
              className="w-40 rounded px-2 py-1 text-xs border outline-none shrink-0"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="unknown">Not sure</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-orange-700 min-w-0 flex-1">Vegetarian options?</span>
            <select
              value={vegetarian}
              onChange={(e) => setVegetarian(e.target.value)}
              className="w-40 rounded px-2 py-1 text-xs border outline-none shrink-0"
            >
              <option value="yes">Yes</option>
              <option value="limited">Limited</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tags */}
      <TagSelector tags={tags} selectedTags={selectedTags} onTagToggle={onTagToggle} />

      {/* Image Upload */}
      <ImageUpload images={images} onImagesChange={onImagesChange} colorScheme={colorScheme} />

      {/* Recommendations */}
      <div className="space-y-2">
        <div>
          <label className="text-sm font-medium">🍽️ What should someone order?</label>
          <input
            type="text"
            placeholder="e.g. Chicken rice with egg"
            value={recommendedDish}
            onChange={(e) => setRecommendedDish(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium">🚫 What should they avoid?</label>
          <input
            type="text"
            placeholder="e.g. Fish is usually overcooked"
            value={avoidDish}
            onChange={(e) => setAvoidDish(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium">🔄 Would you come back?</label>
          <select
            value={wouldReturn}
            onChange={(e) => setWouldReturn(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="">Select...</option>
            <option value="yes">Yes, definitely</option>
            <option value="maybe">Maybe</option>
            <option value="no">No, won't return</option>
          </select>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={config.placeholder}
        rows={4}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
      />
    </div>
  );
}

function ToiletForm(props: CategoryFormProps) {
  const { config, subratings, subratingValues, onSubratingChange, rating, onRatingChange, text, onTextChange, tags, selectedTags, onTagToggle, images, onImagesChange, colorScheme } = props;
  const [building, setBuilding] = useState("");
  const [level, setLevel] = useState("");
  const [gender, setGender] = useState("");
  const [lastRenovated, setLastRenovated] = useState("");
  const [toiletPaper, setToiletPaper] = useState("yes");
  const [soap, setSoap] = useState("yes");
  const [handDryer, setHandDryer] = useState("yes");
  const [crowded, setCrowded] = useState("sometimes");
  const [wouldAvoid, setWouldAvoid] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{config.icon} Overall Rating</span>
        <RatingStars value={rating} onChange={(v) => onRatingChange(v ?? 0)} />
      </div>

      {/* Toilet Context */}
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-teal-50 p-3">
        <div>
          <label className="text-xs font-medium text-teal-800">Building</label>
          <input
            type="text"
            placeholder="e.g. COM1"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-teal-800">Level</label>
          <input
            type="text"
            placeholder="e.g. L2, L3"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-teal-800">Type</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="accessible">Accessible</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-teal-800">Last Renovated</label>
          <input
            type="text"
            placeholder="e.g. 2023"
            value={lastRenovated}
            onChange={(e) => setLastRenovated(e.target.value)}
            className="mt-1 w-full rounded text-sm px-2 py-1 border outline-none"
          />
        </div>
      </div>

      {/* Subratings */}
      <div className="rounded-lg bg-teal-50 p-4 space-y-1">
        <div className="text-sm font-semibold text-teal-800 mb-2">Rate Toilet Quality</div>
        {subratings.map((s) => (
          <SubratingInput
            key={s.key}
            subrating={s}
            value={subratingValues[s.key]}
            onChange={(v) => onSubratingChange(s.key, v)}
          />
        ))}
      </div>

      {/* Facilities */}
      <div className="space-y-2 rounded-lg bg-teal-50 p-3">
        <div className="text-sm font-semibold text-teal-800 mb-2">Facilities</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-teal-700 min-w-0 flex-1">Toilet paper available?</span>
            <select
              value={toiletPaper}
              onChange={(e) => setToiletPaper(e.target.value)}
              className="w-40 rounded px-2 py-1 text-xs border outline-none shrink-0"
            >
              <option value="yes">Yes</option>
              <option value="sometimes">Sometimes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-teal-700 min-w-0 flex-1">Soap available?</span>
            <select
              value={soap}
              onChange={(e) => setSoap(e.target.value)}
              className="w-40 rounded px-2 py-1 text-xs border outline-none shrink-0"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-teal-700 min-w-0 flex-1">Hand dryer working?</span>
            <select
              value={handDryer}
              onChange={(e) => setHandDryer(e.target.value)}
              className="w-40 rounded px-2 py-1 text-xs border outline-none shrink-0"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-teal-700 min-w-0 flex-1">Crowded during peak?</span>
            <select
              value={crowded}
              onChange={(e) => setCrowded(e.target.value)}
              className="w-40 rounded px-2 py-1 text-xs border outline-none shrink-0"
            >
              <option value="never">Never crowded</option>
              <option value="rarely">Rarely crowded</option>
              <option value="sometimes">Sometimes crowded</option>
              <option value="often">Often crowded</option>
              <option value="always">Always crowded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Best time to visit */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">🕐 Best time to visit:</span>
        <select className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-teal-200">
          <option value="">Select...</option>
          <option value="morning">Morning (before 10am)</option>
          <option value="midday">Midday (10am-2pm)</option>
          <option value="afternoon">Afternoon (2pm-6pm)</option>
          <option value="evening">Evening (after 6pm)</option>
          <option value="anytime">Anytime</option>
        </select>
      </div>

      {/* Would avoid toggle */}
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2">
        <input
          type="checkbox"
          checked={wouldAvoid}
          onChange={(e) => setWouldAvoid(e.target.checked)}
          id="would-avoid"
          className="h-4 w-4"
        />
        <label htmlFor="would-avoid" className="text-sm font-medium text-red-800">
          I would actively avoid this toilet
        </label>
      </div>

      {/* Tags */}
      <TagSelector tags={tags} selectedTags={selectedTags} onTagToggle={onTagToggle} />

      {/* Image Upload */}
      <ImageUpload images={images} onImagesChange={onImagesChange} colorScheme={colorScheme} />

      {/* Text prompts */}
      <div className="space-y-2">
        <div>
          <label className="text-sm font-medium">⭐ What stood out (good or bad)?</label>
          <textarea
            placeholder="e.g. Very clean but always crowded during peak hours"
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={config.placeholder}
        rows={3}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200"
      />
    </div>
  );
}

// ============================================================================
// Main ReviewForm Component
// ============================================================================

type ReviewFormProps = {
  entity: Entity;
  onCreated: () => void;
  /** Compact mode for inline forms */
  compact?: boolean;
};

export default function ReviewForm({ entity, onCreated, compact = false }: ReviewFormProps) {
  const { user } = useAuth();
  const config = FORM_CONFIG[entity.type];
  const applicableSubratings = getApplicableSubratings(entity.type, entity);
  const applicableTags = getTagsByType(entity.type);

  // Color scheme for each entity type
  const colorSchemes: Record<EntityType, "amber" | "blue" | "orange" | "teal"> = {
    DORM: "amber",
    CLASSROOM: "blue",
    PROFESSOR: "blue", // Professor has no images
    FOOD_PLACE: "orange",
    TOILET: "teal",
  };

  // Form state - subratings default to 0 (not null)
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [moduleCode, setModuleCode] = useState(""); // For professor reviews
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [subratingValues, setSubratingValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    applicableSubratings.forEach((s) => { initial[s.key] = 0; });
    return initial;
  });

  function updateSubrating(key: string, value: number | null) {
    // Convert null to 0
    setSubratingValues((prev) => ({ ...prev, [key]: value ?? 0 }));
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit() {
    // Only require overall rating - text is optional
    if (rating === 0) {
      console.log("Validation failed: No overall rating selected");
      return;
    }
    
    setSubmitting(true);
    try {
      console.log("Submitting review...", { entityId: entity.id, rating, moduleCode, tags: selectedTags, imageCount: images.length });
      await createReview({
        entityId: entity.id,
        rating,
        text: text.trim(),
        subratings: subratingValues,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        createdAt: Date.now(),
        authorId: user?.uid,
        anonymous,
        // Include module code for professor reviews
        ...(entity.type === "PROFESSOR" && moduleCode ? { moduleCode } : {}),
      });
      
      console.log("Review submitted successfully!");
      
      // Reset form
      setRating(0);
      setText("");
      setModuleCode("");
      setSelectedTags([]);
      setImages([]);
      setSubratingValues(() => {
        const reset: Record<string, number> = {};
        applicableSubratings.forEach((s) => { reset[s.key] = 0; });
        return reset;
      });
      
      onCreated();
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const formProps: CategoryFormProps = {
    entity,
    config,
    subratings: applicableSubratings,
    subratingValues,
    onSubratingChange: updateSubrating,
    rating,
    onRatingChange: setRating,
    text,
    onTextChange: setText,
    anonymous,
    onAnonymousChange: setAnonymous,
    tags: applicableTags,
    selectedTags,
    onTagToggle: toggleTag,
    images,
    onImagesChange: setImages,
    colorScheme: colorSchemes[entity.type],
    // Professor-specific
    moduleCode,
    onModuleCodeChange: setModuleCode,
  };

  // Only require overall rating
  const isValid = rating > 0;

  // Render the appropriate form based on entity type
  function renderCategoryForm() {
    switch (entity.type) {
      case "DORM":
        return <DormForm {...formProps} />;
      case "CLASSROOM":
        return <ClassroomForm {...formProps} />;
      case "PROFESSOR":
        return <ProfessorForm {...formProps} />;
      case "FOOD_PLACE":
        return <FoodPlaceForm {...formProps} />;
      case "TOILET":
        return <ToiletForm {...formProps} />;
      default:
        return null;
    }
  }

  return (
    <Card className={compact ? "space-y-3" : "space-y-4"}>
      {/* Header */}
      <div className="border-b pb-3">
        <h3 className="text-lg font-bold">{config.title}</h3>
        <p className="text-sm text-zinc-500">{entity.name}</p>
      </div>

      {/* Category-specific form */}
      {renderCategoryForm()}

      {/* Anonymous toggle */}
      <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3">
        <div>
          <div className="text-sm font-medium">Post Anonymously</div>
          <div className="text-xs text-zinc-500">
            {anonymous ? "Your identity is hidden" : "Your name may be visible"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAnonymous(!anonymous)}
          className={`relative h-5 w-9 rounded-full transition ${
            anonymous ? "bg-zinc-900" : "bg-zinc-300"
          }`}
        >
          <div
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
              anonymous ? "left-4" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* Validation hint & Submit */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-zinc-400">
          {rating === 0 ? "⚠️ Select an overall rating to submit" : "✓ Ready to submit"}
        </div>
        <Button onClick={handleSubmit} disabled={!isValid || submitting}>
          {submitting ? "Posting..." : "Submit Review"}
        </Button>
      </div>
    </Card>
  );
}
