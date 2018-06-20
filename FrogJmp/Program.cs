using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FrogJmp
{
	class Program
	{
		static void Main(string[] args)
		{
			Console.WriteLine("O resultado é: {0}", solution(10, 85, 30));
			Console.ReadLine();
		}
		public static int solution(int X, int Y, int D)
		{
			int minVal = 1;
			int maxval = 1000000000;

			if (X < minVal || Y < minVal || D < minVal)
				return 0;

			if (X > maxval || Y > maxval || D > maxval)
				return 0;

			int distance = Y - X;
			double jumps = (double)distance / (double)D;

			return (int)(jumps % 1 == 0 ? jumps : jumps + 1);
		}
	}
}
