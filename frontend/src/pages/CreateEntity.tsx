import CreateEntityForm from "@/features/entities/CreateEntityForm";

export default function CreateEntity() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Add Something New</h1>
        <p className="text-zinc-500 mt-1">
          Can't find what you're looking for? Add it to RateMyNUS!
        </p>
      </div>

      {/* Form */}
      <CreateEntityForm />
    </div>
  );
}
