import { describe, it, expect } from "vitest";
import { render } from "../../utils/test-utils";
import {
  TaskSkeleton,
  TaskListSkeleton,
  GTDListSkeleton,
  DashboardSkeleton,
} from "@/components/ui/task-skeleton";

describe("TaskSkeleton", () => {
  describe("basic rendering", () => {
    it("should render task skeleton with all elements", () => {
      const { container } = render(<TaskSkeleton />);

      // Check for card structure
      const card = container.querySelector('.border-l-4');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('border-l-brand-gray-200', 'animate-pulse');

      // Check for checkbox skeleton
      const checkbox = container.querySelector('.h-5.w-5.rounded-full');
      expect(checkbox).toBeInTheDocument();

      // Check for content elements
      const titleSkeleton = container.querySelector('.h-5.w-3\\/4');
      expect(titleSkeleton).toBeInTheDocument();

      // Check for metadata skeletons
      const metadataSkeletons = container.querySelectorAll('.h-3');
      expect(metadataSkeletons.length).toBeGreaterThan(0);

      // Check for menu button skeleton
      const menuButton = container.querySelector('.h-6.w-6.rounded');
      expect(menuButton).toBeInTheDocument();
    });

    it("should render in normal mode with description", () => {
      const { container } = render(<TaskSkeleton />);

      // Should have description skeletons (2 lines)
      const descriptionSkeletons = container.querySelectorAll('.h-4.w-full, .h-4.w-2\\/3');
      expect(descriptionSkeletons.length).toBe(2);

      // Should have 4 metadata items in normal mode
      const metadataSkeletons = container.querySelectorAll('.h-3');
      expect(metadataSkeletons.length).toBe(4);
    });

    it("should render in compact mode", () => {
      const { container } = render(<TaskSkeleton compact />);

      // Title should be smaller in compact mode
      const titleSkeleton = container.querySelector('.h-4');
      expect(titleSkeleton).toBeInTheDocument();

      // Should not have description skeletons
      const descriptionSkeletons = container.querySelectorAll('.h-4.w-full, .h-4.w-2\\/3');
      expect(descriptionSkeletons.length).toBe(0);

      // Should have 3 metadata items in compact mode
      const metadataSkeletons = container.querySelectorAll('.h-3');
      expect(metadataSkeletons.length).toBe(3);

      // Padding should be reduced
      const content = container.querySelector('.p-3');
      expect(content).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<TaskSkeleton className="custom-skeleton" />);

      expect(container.firstChild).toHaveClass('custom-skeleton');
    });
  });

  describe("layout structure", () => {
    it("should have proper flex layout", () => {
      const { container } = render(<TaskSkeleton />);

      const flexContainer = container.querySelector('.flex.items-start.gap-3');
      expect(flexContainer).toBeInTheDocument();

      const contentArea = container.querySelector('.flex-1.min-w-0');
      expect(contentArea).toBeInTheDocument();
    });

    it("should have proper spacing", () => {
      const { container } = render(<TaskSkeleton />);

      const contentArea = container.querySelector('.space-y-2');
      expect(contentArea).toBeInTheDocument();

      const metadataArea = container.querySelector('.flex.flex-wrap.items-center.gap-2');
      expect(metadataArea).toBeInTheDocument();
    });
  });

  describe("responsive design", () => {
    it("should have responsive padding", () => {
      const { container } = render(<TaskSkeleton />);

      // Normal padding
      expect(container.querySelector('.p-4')).toBeInTheDocument();
    });

    it("should have responsive padding in compact mode", () => {
      const { container } = render(<TaskSkeleton compact />);

      // Compact padding
      expect(container.querySelector('.p-3')).toBeInTheDocument();
    });
  });
});

describe("TaskListSkeleton", () => {
  describe("basic rendering", () => {
    it("should render default number of task skeletons", () => {
      const { container } = render(<TaskListSkeleton />);

      const taskSkeletons = container.querySelectorAll('.border-l-4.border-l-brand-gray-200');
      expect(taskSkeletons.length).toBe(5); // Default count
    });

    it("should render custom number of task skeletons", () => {
      const { container } = render(<TaskListSkeleton count={3} />);

      const taskSkeletons = container.querySelectorAll('.border-l-4.border-l-brand-gray-200');
      expect(taskSkeletons.length).toBe(3);
    });

    it("should render in compact mode", () => {
      const { container } = render(<TaskListSkeleton compact />);

      // Check that tasks are rendered in compact mode (no description skeletons)
      const descriptionSkeletons = container.querySelectorAll('.h-4.w-full');
      expect(descriptionSkeletons.length).toBe(0);
    });

    it("should apply custom className", () => {
      const { container } = render(<TaskListSkeleton className="custom-list" />);

      expect(container.firstChild).toHaveClass('custom-list');
    });

    it("should have proper spacing", () => {
      const { container } = render(<TaskListSkeleton />);

      expect(container.firstChild).toHaveClass('space-y-3');
    });
  });

  describe("header functionality", () => {
    it("should not render header by default", () => {
      const { container } = render(<TaskListSkeleton />);

      const header = container.querySelector('.flex.items-center.justify-between.mb-4');
      expect(header).not.toBeInTheDocument();
    });

    it("should render header when withHeader is true", () => {
      const { container } = render(<TaskListSkeleton withHeader />);

      const header = container.querySelector('.flex.items-center.justify-between.mb-4');
      expect(header).toBeInTheDocument();

      // Check header elements
      const headerIcon = header?.querySelector('.h-5.w-5');
      const headerTitle = header?.querySelector('.h-6.w-24');
      const headerBadge = header?.querySelector('.h-5.w-8.rounded-full');
      const headerAction = header?.querySelector('.h-4.w-4');

      expect(headerIcon).toBeInTheDocument();
      expect(headerTitle).toBeInTheDocument();
      expect(headerBadge).toBeInTheDocument();
      expect(headerAction).toBeInTheDocument();
    });

    it("should have proper header layout", () => {
      const { container } = render(<TaskListSkeleton withHeader />);

      const headerLeft = container.querySelector('.flex.items-center.gap-3');
      expect(headerLeft).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle zero count", () => {
      const { container } = render(<TaskListSkeleton count={0} />);

      const taskSkeletons = container.querySelectorAll('.border-l-4.border-l-brand-gray-200');
      expect(taskSkeletons.length).toBe(0);
    });

    it("should handle large count", () => {
      const { container } = render(<TaskListSkeleton count={20} />);

      const taskSkeletons = container.querySelectorAll('.border-l-4.border-l-brand-gray-200');
      expect(taskSkeletons.length).toBe(20);
    });
  });
});

describe("GTDListSkeleton", () => {
  describe("basic rendering", () => {
    it("should render GTD list skeleton structure", () => {
      const { container } = render(<GTDListSkeleton />);

      // Check for card container
      const card = container.querySelector('.min-h-\\[400px\\]');
      expect(card).toBeInTheDocument();

      // Check for header section
      const header = container.querySelector('.p-6.pb-3');
      expect(header).toBeInTheDocument();

      // Check for content section
      const content = container.querySelector('.px-6.pb-6');
      expect(content).toBeInTheDocument();
    });

    it("should render header elements", () => {
      const { container } = render(<GTDListSkeleton />);

      const header = container.querySelector('.p-6.pb-3');

      // Header left elements
      const headerIcon = header?.querySelector('.h-5.w-5');
      const headerTitle = header?.querySelector('.h-6.w-20');
      expect(headerIcon).toBeInTheDocument();
      expect(headerTitle).toBeInTheDocument();

      // Header right elements
      const headerBadge = header?.querySelector('.h-5.w-8.rounded-full');
      const headerAction = header?.querySelector('.h-4.w-4');
      expect(headerBadge).toBeInTheDocument();
      expect(headerAction).toBeInTheDocument();
    });

    it("should render task list in content", () => {
      const { container } = render(<GTDListSkeleton />);

      // Should contain task skeletons (4 by default in compact mode)
      const taskSkeletons = container.querySelectorAll('.border-l-4.border-l-brand-gray-200');
      expect(taskSkeletons.length).toBe(4);

      // Should be in compact mode (no description skeletons)
      const descriptionSkeletons = container.querySelectorAll('.h-4.w-full');
      expect(descriptionSkeletons.length).toBe(0);
    });

    it("should apply custom className", () => {
      const { container } = render(<GTDListSkeleton className="custom-gtd-list" />);

      expect(container.firstChild).toHaveClass('custom-gtd-list');
    });
  });

  describe("layout structure", () => {
    it("should have proper header layout", () => {
      const { container } = render(<GTDListSkeleton />);

      const headerContainer = container.querySelector('.flex.items-center.justify-between');
      expect(headerContainer).toBeInTheDocument();

      const headerLeft = container.querySelector('.flex.items-center.gap-3');
      const headerRight = container.querySelector('.flex.items-center.gap-2');
      expect(headerLeft).toBeInTheDocument();
      expect(headerRight).toBeInTheDocument();
    });
  });
});

describe("DashboardSkeleton", () => {
  describe("basic rendering", () => {
    it("should render complete dashboard skeleton structure", () => {
      const { container } = render(<DashboardSkeleton />);

      // Check for main container
      const mainContainer = container.querySelector('.space-y-6');
      expect(mainContainer).toBeInTheDocument();

      // Check for header section
      const headerSection = container.querySelector('.space-y-4');
      expect(headerSection).toBeInTheDocument();

      // Check for stats grid
      const statsGrid = container.querySelector('.grid.grid-cols-2.lg\\:grid-cols-5.gap-4');
      expect(statsGrid).toBeInTheDocument();

      // Check for GTD lists grid
      const gtdGrid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2.xl\\:grid-cols-3.gap-6');
      expect(gtdGrid).toBeInTheDocument();
    });

    it("should render header elements", () => {
      const { container } = render(<DashboardSkeleton />);

      // Title and subtitle
      const titleSkeleton = container.querySelector('.h-8.w-48');
      const subtitleSkeleton = container.querySelector('.h-4.w-72');
      expect(titleSkeleton).toBeInTheDocument();
      expect(subtitleSkeleton).toBeInTheDocument();

      // Action button
      const actionButton = container.querySelector('.h-10.w-32');
      expect(actionButton).toBeInTheDocument();
    });

    it("should render controls section", () => {
      const { container } = render(<DashboardSkeleton />);

      const controlsContainer = container.querySelector('.flex.flex-col.sm\\:flex-row.gap-3');
      expect(controlsContainer).toBeInTheDocument();

      // Control elements
      const searchBar = container.querySelector('.h-10.flex-1');
      const filterDropdown = container.querySelector('.h-10.w-48');
      const sortButton = container.querySelector('.h-10.w-24');

      expect(searchBar).toBeInTheDocument();
      expect(filterDropdown).toBeInTheDocument();
      expect(sortButton).toBeInTheDocument();
    });

    it("should render stats cards", () => {
      const { container } = render(<DashboardSkeleton />);

      const statsCards = container.querySelectorAll('.grid.grid-cols-2.lg\\:grid-cols-5.gap-4 .border-l-4');
      expect(statsCards.length).toBe(5);

      // Check individual stat card structure
      const firstCard = statsCards[0];
      const statIcon = firstCard.querySelector('.h-4.w-4');
      const statLabel = firstCard.querySelector('.h-4.w-16');
      const statValue = firstCard.querySelector('.h-6.w-6');

      expect(statIcon).toBeInTheDocument();
      expect(statLabel).toBeInTheDocument();
      expect(statValue).toBeInTheDocument();
    });

    it("should render GTD lists grid", () => {
      const { container } = render(<DashboardSkeleton />);

      const gtdLists = container.querySelectorAll('.grid.grid-cols-1.lg\\:grid-cols-2.xl\\:grid-cols-3.gap-6 .min-h-\\[400px\\]');
      expect(gtdLists.length).toBe(6);
    });

    it("should apply custom className", () => {
      const { container } = render(<DashboardSkeleton className="custom-dashboard" />);

      expect(container.firstChild).toHaveClass('custom-dashboard');
    });
  });

  describe("responsive layout", () => {
    it("should have responsive grid classes", () => {
      const { container } = render(<DashboardSkeleton />);

      // Stats grid responsiveness
      const statsGrid = container.querySelector('.grid-cols-2.lg\\:grid-cols-5');
      expect(statsGrid).toBeInTheDocument();

      // GTD lists grid responsiveness
      const gtdGrid = container.querySelector('.grid-cols-1.lg\\:grid-cols-2.xl\\:grid-cols-3');
      expect(gtdGrid).toBeInTheDocument();
    });

    it("should have responsive controls layout", () => {
      const { container } = render(<DashboardSkeleton />);

      const controlsContainer = container.querySelector('.flex-col.sm\\:flex-row');
      expect(controlsContainer).toBeInTheDocument();
    });
  });

  describe("layout structure", () => {
    it("should have proper header layout", () => {
      const { container } = render(<DashboardSkeleton />);

      const headerContainer = container.querySelector('.flex.items-center.justify-between');
      expect(headerContainer).toBeInTheDocument();

      const headerLeft = container.querySelector('.space-y-2');
      expect(headerLeft).toBeInTheDocument();
    });

    it("should have proper spacing between sections", () => {
      const { container } = render(<DashboardSkeleton />);

      const mainContainer = container.querySelector('.space-y-6');
      expect(mainContainer).toBeInTheDocument();

      const headerSection = container.querySelector('.space-y-4');
      expect(headerSection).toBeInTheDocument();
    });
  });
});

describe("Animation and styling", () => {
  it("should have pulse animation on TaskSkeleton", () => {
    const { container } = render(<TaskSkeleton />);

    const card = container.querySelector('.animate-pulse');
    expect(card).toBeInTheDocument();
  });

  it("should have consistent border styling", () => {
    const { container } = render(<TaskSkeleton />);

    const card = container.querySelector('.border-l-4.border-l-brand-gray-200');
    expect(card).toBeInTheDocument();
  });

  it("should have consistent border styling in stats cards", () => {
    const { container } = render(<DashboardSkeleton />);

    const statsCards = container.querySelectorAll('.border-l-4.border-l-brand-gray-200');
    expect(statsCards.length).toBeGreaterThan(0);
  });
});

describe("Accessibility", () => {
  it("should not interfere with screen readers", () => {
    const { container } = render(<TaskSkeleton />);

    // Skeleton components should not have interactive elements
    const buttons = container.querySelectorAll('button');
    const links = container.querySelectorAll('a');
    const inputs = container.querySelectorAll('input');

    expect(buttons.length).toBe(0);
    expect(links.length).toBe(0);
    expect(inputs.length).toBe(0);
  });

  it("should maintain proper structural semantics", () => {
    const { container } = render(<GTDListSkeleton />);

    // Should maintain card structure for consistency
    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });
});