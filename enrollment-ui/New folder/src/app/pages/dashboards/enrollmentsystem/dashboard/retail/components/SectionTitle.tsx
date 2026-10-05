type Props = { title: string };

const SectionTitle = ({ title }: Props) => (
  <div className="bg-primary text-black text-center py-2 font-semibold tracking-wide">
    {title}
  </div>
);

export default SectionTitle;