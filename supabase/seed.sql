-- Seed courses data
INSERT INTO public.courses (title, provider, duration, level, image, url, match, description)
VALUES
  ('Advanced JavaScript Concepts', 'Udemy', '12 weeks', 'Intermediate', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=500&q=80', 'https://udemy.com', 96, 'Master advanced JavaScript concepts including closures, prototypes, and async patterns.'),
  ('Leadership for Technical Professionals', 'Coursera', '8 weeks', 'Intermediate', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=80', 'https://coursera.org', 92, 'Learn how to transition from a technical role to a leadership position.'),
  ('System Design for Web Applications', 'edX', '10 weeks', 'Advanced', 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=500&q=80', 'https://edx.org', 88, 'Learn to design scalable systems for web applications.'),
  ('React Performance Optimization', 'Frontend Masters', '6 weeks', 'Advanced', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80', 'https://frontendmasters.com', 85, 'Master techniques to optimize React application performance.'),
  ('Cloud Architecture on AWS', 'AWS Learning', '14 weeks', 'Intermediate', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80', 'https://aws.amazon.com/training', 82, 'Learn to design and implement cloud solutions on AWS.'),
  ('Data Structures and Algorithms', 'Pluralsight', '16 weeks', 'Intermediate', 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&w=500&q=80', 'https://pluralsight.com', 78, 'Master essential computer science concepts for technical interviews.');

-- Note: For user-specific data like skills and career paths,
-- we can't seed them until a user is created since they require a user_id.
-- In a real application, you would create these when a user completes onboarding. 