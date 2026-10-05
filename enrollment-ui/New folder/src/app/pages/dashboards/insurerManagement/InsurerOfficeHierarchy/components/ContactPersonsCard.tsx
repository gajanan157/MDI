import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

interface ContactPerson {
  name: string;
  email?: string;
  phone?: string;
  designation?: string;
}

interface ContactPersonsCardProps {
  contacts?: ContactPerson[];
}

export function ContactPersonsCard({ contacts }: Readonly<ContactPersonsCardProps>) {
  return (
    <div className="bg-linear-to-br from-muted/50 to-muted/30 rounded-md p-2 border border-border shadow-sm w-full h-full flex flex-col overflow-hidden">
      <h4 className="text-xs font-semibold text-foreground mb-1.5 pb-0.5 border-b border-border shrink-0">
        Contacts ({contacts?.length || 0})
      </h4>
      {contacts && contacts.length > 0 ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden mt-1.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="flex gap-2 min-w-max pb-1 pr-2">
            {contacts.map((contact, idx) => (
              <div
                key={idx}
                className="bg-background rounded-lg p-2 border border-border hover:border-primary/40 hover:shadow-sm transition-all duration-200 min-w-[200px] max-w-[200px] shrink-0 h-fit"
              >
                <div className="flex items-start gap-1.5 mb-1.5">
                  <div className="shrink-0 mt-0.5">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <UserIcon className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-foreground mb-0.5 wrap-break-word">
                      {contact.name}
                    </div>
                    {contact.designation && (
                      <div className="text-[10px] text-muted-foreground italic wrap-break-word">
                        {contact.designation}
                      </div>
                    )}
                  </div>
                </div>                
                <div className="space-y-1 ml-10">
                  {contact.email && (
                    <div className="flex items-center gap-1.5 min-w-0 group">
                      <EnvelopeIcon className="h-3 w-3 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-[10px] text-foreground hover:text-primary transition-colors break-all overflow-wrap-anywhere flex-1"
                        title={contact.email}
                        style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-1.5 min-w-0 group">
                      <PhoneIcon className="h-3 w-3 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-[10px] text-foreground hover:text-primary transition-colors break-all flex-1"
                        title={contact.phone}
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground text-center py-4 bg-muted/30 rounded-lg mt-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            <UserIcon className="h-5 w-5 text-muted-foreground/50" />
            <span>No contacts</span>
          </div>
        </div>
      )}
    </div>
  );
}

