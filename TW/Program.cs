using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TW
{
	class Program
	{
		static void Main(string[] args)
		{
			int xMax, yMax;
			List<Robot> robots = new List<Robot>();

			string fieldSize = Console.ReadLine();
			string[] xyn = fieldSize.Split(' ');

			xMax = int.Parse(xyn[0]);
			yMax = int.Parse(xyn[1]);
			
			Robot robot = ReadRobot();
			ReadMovements(ref robot, xMax, yMax);

			robots.Add(robot);

			Console.WriteLine("{0} {1} {2}", robot.X, robot.Y, robot.D);
			Console.ReadLine();
		}
		static Robot ReadRobot()
		{
			Robot robot;
			string robotPosition = Console.ReadLine();

			string[] rArr = robotPosition.Split(' ');

			robot = new Robot(int.Parse(rArr[0].ToString()), int.Parse(rArr[1]), rArr[2][0]);

			return robot;
		}
		static void ReadMovements(ref Robot robot, int xMax, int yMax)
		{
			string m = Console.ReadLine();
			char[] mArr = m.ToCharArray();

			for (int i = 0; i < m.Length; i++)
			{
				switch (mArr[i])
				{
					case 'L':
						if (robot.D == 'N') robot.D = 'W';
						else if (robot.D == 'W') robot.D = 'S';
						else if (robot.D == 'S') robot.D = 'E';
						else robot.D = 'N';
						break;
					case 'R':
						if (robot.D == 'N') robot.D = 'E';
						else if (robot.D == 'E') robot.D = 'S';
						else if (robot.D == 'S') robot.D = 'W';
						else robot.D = 'N';
						break;
					case 'M':
						if (robot.D == 'S' && robot.Y > 0)
						{
							robot.Y--;
						}
						else if (robot.D == 'N' && robot.Y < yMax)
						{
							robot.Y++;
						}
						else if (robot.D == 'E' && robot.X < xMax)
						{
							robot.X++;
						}
						else if (robot.D == 'W' && robot.X > 0)
						{
							robot.X--;
						}
						break;
				}
			}
		}
	}

	struct Robot
	{
		public Robot(int x, int y, char d)
		{
			this.X = x;
			this.Y = y;
			this.D = d;
		}

		public int X;
		public int Y;
		public char D;
	}
}
