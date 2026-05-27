import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TeamPage from "../pages/team/TeamPage";
import { teamMembers } from "../data/teamData";

describe("TeamPage Component", () => {
  const mockOnBack = vi.fn();
  const mockOnApply = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => teamMembers,
    });
  });

  it("renders team page with title", async () => {
    render(<TeamPage onBack={mockOnBack} onApply={mockOnApply} />);
    expect((await screen.findAllByText(/Core Team/i)).length).toBeGreaterThan(
      0
    );
  });

  it("displays leadership section", async () => {
    render(<TeamPage onBack={mockOnBack} onApply={mockOnApply} />);
    expect(await screen.findByText(/Leadership/i)).toBeInTheDocument();
  });

  it("displays core members section", async () => {
    render(<TeamPage onBack={mockOnBack} onApply={mockOnApply} />);
    expect(await screen.findByText(/Core Members/i)).toBeInTheDocument();
  });

  it("renders apply card with call to action", () => {
    render(<TeamPage onBack={mockOnBack} onApply={mockOnApply} />);
    expect(screen.getByText(/Want to Join NexaSphere/i)).toBeInTheDocument();
    expect(screen.getByText(/Apply Here/i)).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<TeamPage onBack={mockOnBack} onApply={mockOnApply} />);
    const backBtn = screen.getByText(/← Back/);
    expect(backBtn).toBeInTheDocument();
  });

  it("displays at least one team member card", async () => {
    render(<TeamPage onBack={mockOnBack} onApply={mockOnApply} />);
    const orgMembers = teamMembers.filter(
      (m) => m.role === "Organiser" || m.role === "Co-organiser"
    );
    if (orgMembers.length > 0) {
      expect(await screen.findByText(orgMembers[0].name)).toBeInTheDocument();
    }
  });

  it("renders call to action title", () => {
    render(<TeamPage onBack={mockOnBack} onApply={mockOnApply} />);
    expect(screen.getByText(/Want to Join NexaSphere/i)).toBeInTheDocument();
  });
});
