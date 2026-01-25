export default function Courses({ params }: { params: { id: string } }) {
  return (
    <div>
      Admin Manage Courses Page, ID: {params.id}
    </div>
  );
}