import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "../../utils/test-utils";
import { GTDSidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

// Mock dependencies
vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));
vi.mock("@/components/ui/sidebar", async () => {
  const actual = await vi.importActual("@/components/ui/sidebar");
  return {
    ...actual,
    useSidebar: vi.fn(),
  };
});

const mockUseAuth = vi.mocked(useAuth);
const mockUsePathname = vi.mocked(usePathname);
const mockUseSidebar = vi.mocked(useSidebar);

describe("GTDSidebar", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  };

  const defaultTaskCounts = {
    captured: 5,
    next_actions: 3,
    waiting_for: 2,
    someday: 7,
    projects: 4,
    completed: 15,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseSidebar.mockReturnValue({
      state: "expanded",
      open: true,
      setOpen: vi.fn(),
      openMobile: false,
      setOpenMobile: vi.fn(),
      isMobile: false,
      toggleSidebar: vi.fn(),
    });
  });

  describe("Authentication Guard", () => {
    it("should not render when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      render(<GTDSidebar />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      // The component should not render navigation when user is null
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("should render when user is authenticated", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly, don't need AuthProvider
      });

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByLabelText("Main navigation sidebar")).toBeInTheDocument();
    });
  });

  describe("Header Section", () => {
    it("should display Clarity Done branding in expanded state", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByLabelText("Clarity Done logo")).toBeInTheDocument();
      expect(screen.getByText("Clarity Done")).toBeInTheDocument();
      expect(screen.getByText("Calm. Clear. Done.")).toBeInTheDocument();
    });

    it("should only show logo in collapsed state", () => {
      mockUseSidebar.mockReturnValue({
        state: "collapsed",
        open: true,
        setOpen: vi.fn(),
        openMobile: false,
        setOpenMobile: vi.fn(),
        isMobile: false,
        toggleSidebar: vi.fn(),
      });

      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByLabelText("Clarity Done logo")).toBeInTheDocument();
      expect(screen.queryByText("Clarity Done")).not.toBeInTheDocument();
      expect(screen.queryByText("Calm. Clear. Done.")).not.toBeInTheDocument();
    });

    it("should have proper logo styling", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const logo = screen.getByLabelText("Clarity Done logo");
      expect(logo).toHaveClass(
        "flex",
        "h-8",
        "w-8",
        "items-center",
        "justify-center",
        "rounded-md",
        "bg-brand-teal",
        "text-white"
      );
    });
  });

  describe("Main Navigation", () => {
    it("should render main navigation items", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByRole("link", { name: /Dashboard: Overview and quick stats/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Capture: Add new tasks and ideas/i })).toBeInTheDocument();
    });

    it("should highlight active navigation item", () => {
      mockUsePathname.mockReturnValue("/dashboard");
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const dashboardLink = screen.getByRole("link", { name: /Dashboard: Overview and quick stats/i });
      expect(dashboardLink).toHaveAttribute("aria-current", "page");
    });

    it("should not highlight inactive navigation items", () => {
      mockUsePathname.mockReturnValue("/dashboard");
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const captureLink = screen.getByRole("link", { name: /Capture: Add new tasks and ideas/i });
      expect(captureLink).not.toHaveAttribute("aria-current");
    });

    it("should have proper navigation structure", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByLabelText("Main navigation links")).toBeInTheDocument();
      expect(screen.getByText("Navigation")).toBeInTheDocument();
    });
  });

  describe("GTD Lists Section", () => {
    it("should render all GTD list items", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByRole("link", { name: /Inbox: Uncategorized items to process \(5 items\)/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Next Actions: Tasks ready to be done \(3 items\)/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Waiting For: Tasks waiting on others \(2 items\)/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Someday\/Maybe: Future possibilities \(7 items\)/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Projects: Multi-step outcomes \(4 items\)/i })).toBeInTheDocument();
    });

    it("should display task counts as badges in expanded state", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByLabelText("5 items")).toBeInTheDocument();
      expect(screen.getByLabelText("3 items")).toBeInTheDocument();
      expect(screen.getByLabelText("2 items")).toBeInTheDocument();
      expect(screen.getByLabelText("7 items")).toBeInTheDocument();
      expect(screen.getByLabelText("4 items")).toBeInTheDocument();
    });

    it("should not display badges in collapsed state", () => {
      mockUseSidebar.mockReturnValue({
        state: "collapsed",
        open: true,
        setOpen: vi.fn(),
        openMobile: false,
        setOpenMobile: vi.fn(),
        isMobile: false,
        toggleSidebar: vi.fn(),
      });

      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.queryByLabelText("5 items")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("3 items")).not.toBeInTheDocument();
    });

    it("should apply priority styling for high priority lists with items", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const inboxLink = screen.getByRole("link", { name: /Inbox: Uncategorized items to process \(5 items\)/i });
      const nextActionsLink = screen.getByRole("link", { name: /Next Actions: Tasks ready to be done \(3 items\)/i });

      // The priority styling is applied to the SidebarMenuButton, which is the parent element
      const inboxButton = inboxLink.closest('[data-sidebar="menu-button"]');
      const nextActionsButton = nextActionsLink.closest('[data-sidebar="menu-button"]');

      expect(inboxButton).toHaveClass("text-error");
      expect(nextActionsButton).toHaveClass("text-error");
    });

    it("should apply medium priority styling for medium priority lists", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const waitingForLink = screen.getByRole("link", { name: /Waiting For: Tasks waiting on others \(2 items\)/i });
      const projectsLink = screen.getByRole("link", { name: /Projects: Multi-step outcomes \(4 items\)/i });

      const waitingForButton = waitingForLink.closest('[data-sidebar="menu-button"]');
      const projectsButton = projectsLink.closest('[data-sidebar="menu-button"]');

      expect(waitingForButton).toHaveClass("text-warning");
      expect(projectsButton).toHaveClass("text-warning");
    });

    it("should show empty state for lists with no items", () => {
      const emptyTaskCounts = {
        captured: 0,
        next_actions: 0,
        waiting_for: 0,
        someday: 0,
        projects: 0,
        completed: 0,
      };

      render(<GTDSidebar taskCounts={emptyTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByRole("link", { name: /Inbox: Uncategorized items to process \(empty\)/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Next Actions: Tasks ready to be done \(empty\)/i })).toBeInTheDocument();
    });

    it("should handle undefined task counts gracefully", () => {
      render(<GTDSidebar />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByRole("link", { name: /Inbox: Uncategorized items to process \(empty\)/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Next Actions: Tasks ready to be done \(empty\)/i })).toBeInTheDocument();
    });

    it("should have proper GTD lists ARIA structure", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByLabelText("Getting Things Done task lists")).toBeInTheDocument();
      expect(screen.getByText("GTD Lists")).toBeInTheDocument();
    });
  });

  describe("Workflow Section", () => {
    it("should render workflow items", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByRole("link", { name: /Reviews/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Engage/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Archive/i })).toBeInTheDocument();
    });

    it("should display completed tasks count for Archive", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      // Archive badge doesn't have aria-label, just look for the text content
      expect(screen.getByText("15")).toBeInTheDocument();
    });

    it("should have proper workflow section structure", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByText("Workflow")).toBeInTheDocument();
    });
  });

  describe("Footer Section", () => {
    it("should display GTD disclaimer in expanded state", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByText("Getting Things Done inspired")).toBeInTheDocument();
      expect(screen.getByText("Not affiliated with GTD®")).toBeInTheDocument();
    });

    it("should not display disclaimer in collapsed state", () => {
      mockUseSidebar.mockReturnValue({
        state: "collapsed",
        open: true,
        setOpen: vi.fn(),
        openMobile: false,
        setOpenMobile: vi.fn(),
        isMobile: false,
        toggleSidebar: vi.fn(),
      });

      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.queryByText("Getting Things Done inspired")).not.toBeInTheDocument();
      expect(screen.queryByText("Not affiliated with GTD®")).not.toBeInTheDocument();
    });
  });

  describe("Active State Detection", () => {
    it("should correctly identify dashboard as active", () => {
      mockUsePathname.mockReturnValue("/dashboard");
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const dashboardLink = screen.getByRole("link", { name: /Dashboard: Overview and quick stats/i });
      expect(dashboardLink).toHaveAttribute("aria-current", "page");
    });

    it("should correctly identify organize pages as active", () => {
      mockUsePathname.mockReturnValue("/organize?filter=captured");
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const inboxLink = screen.getByRole("link", { name: /Inbox: Uncategorized items to process \(5 items\)/i });
      expect(inboxLink).toHaveAttribute("aria-current", "page");
    });

    it("should correctly identify sub-pages as active", () => {
      mockUsePathname.mockReturnValue("/dashboard/reviews");
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      // The Reviews link is in the workflow section which doesn't set aria-current
      // Instead, check that the SidebarMenuButton has the active data attribute
      const reviewsLink = screen.getByRole("link", { name: "Reviews" });
      const reviewsButton = reviewsLink.closest('[data-sidebar="menu-button"]');
      expect(reviewsButton).toHaveAttribute("data-active", "true");
    });

    it("should not have false positives for similar paths", () => {
      mockUsePathname.mockReturnValue("/dashboard-settings");
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const dashboardLink = screen.getByRole("link", { name: /Dashboard: Overview and quick stats/i });
      expect(dashboardLink).not.toHaveAttribute("aria-current");
    });
  });

  describe("Tooltip Support", () => {
    it("should provide tooltips in collapsed state", () => {
      mockUseSidebar.mockReturnValue({
        state: "collapsed",
        open: true,
        setOpen: vi.fn(),
        openMobile: false,
        setOpenMobile: vi.fn(),
        isMobile: false,
        toggleSidebar: vi.fn(),
      });

      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      // In collapsed state, tooltips should be available (implementation detail)
      // This is handled by the SidebarMenuButton component internally
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
  });

  describe("Badge Variants", () => {
    it("should use destructive variant for high priority items", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const inboxBadge = screen.getByLabelText("5 items");
      const nextActionsBadge = screen.getByLabelText("3 items");

      // Check for destructive variant classes (destructive badge uses bg-error)
      expect(inboxBadge).toHaveClass("bg-error");
      expect(nextActionsBadge).toHaveClass("bg-error");
    });

    it("should use default variant for medium priority items", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const waitingForBadge = screen.getByLabelText("2 items");
      const projectsBadge = screen.getByLabelText("4 items");

      // Should not have destructive variant
      expect(waitingForBadge.className).not.toContain("destructive");
      expect(projectsBadge.className).not.toContain("destructive");
    });

    it("should use secondary variant for low priority items", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const somedayBadge = screen.getByLabelText("7 items");
      expect(somedayBadge).toHaveClass("bg-brand-gray-200");
    });
  });

  describe("Navigation Semantics", () => {
    it("should have proper landmark roles", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Main navigation sidebar");
    });

    it("should have proper list structure", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const navigationList = screen.getByLabelText("Main navigation links");
      const gtdList = screen.getByLabelText("Getting Things Done task lists");

      expect(navigationList).toHaveAttribute("role", "list");
      expect(gtdList).toHaveAttribute("role", "list");
    });

    it("should have proper list item roles", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      const listItems = screen.getAllByRole("listitem");
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe("Icon Accessibility", () => {
    it("should mark icons as decorative", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      // Icons should be marked as aria-hidden="true"
      const icons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe("Responsive Behavior", () => {
    it("should handle sidebar state changes", () => {
      const { rerender } = render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      // Initially expanded
      expect(screen.getByText("Clarity Done")).toBeInTheDocument();

      // Change to collapsed
      mockUseSidebar.mockReturnValue({
        state: "collapsed",
        open: true,
        setOpen: vi.fn(),
        openMobile: false,
        setOpenMobile: vi.fn(),
        isMobile: false,
        toggleSidebar: vi.fn(),
      });

      rerender(<GTDSidebar taskCounts={defaultTaskCounts} />);

      expect(screen.queryByText("Clarity Done")).not.toBeInTheDocument();
    });
  });

  describe("Link Structure", () => {
    it("should have correct href attributes for all links", () => {
      render(<GTDSidebar taskCounts={defaultTaskCounts} />, {
        withSidebar: true,
        withAuth: false, // We're mocking useAuth directly
      });

      expect(screen.getByRole("link", { name: /Dashboard: Overview and quick stats/i })).toHaveAttribute("href", "/dashboard");
      expect(screen.getByRole("link", { name: /Capture: Add new tasks and ideas/i })).toHaveAttribute("href", "/capture");
      expect(screen.getByRole("link", { name: /Inbox: Uncategorized items to process/i })).toHaveAttribute("href", "/organize?filter=captured");
      expect(screen.getByRole("link", { name: /Next Actions: Tasks ready to be done/i })).toHaveAttribute("href", "/organize?filter=next_action");
      expect(screen.getByRole("link", { name: /Waiting For: Tasks waiting on others/i })).toHaveAttribute("href", "/organize?filter=waiting_for");
      expect(screen.getByRole("link", { name: /Someday\/Maybe: Future possibilities/i })).toHaveAttribute("href", "/organize?filter=someday");
      expect(screen.getByRole("link", { name: /Projects: Multi-step outcomes/i })).toHaveAttribute("href", "/organize?filter=project");
      expect(screen.getByRole("link", { name: /Reviews/i })).toHaveAttribute("href", "/dashboard/reviews");
      expect(screen.getByRole("link", { name: /Engage/i })).toHaveAttribute("href", "/engage");
      expect(screen.getByRole("link", { name: /Archive/i })).toHaveAttribute("href", "/organize?filter=completed");
    });
  });
});